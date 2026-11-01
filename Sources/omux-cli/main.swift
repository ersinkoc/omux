import Foundation
import OmuxCLIProtocol

/// The `omux` command, run inside a session omux started. It finds the app through the
/// session's environment and talks to it over a Unix socket that only this user can open.
let env = ProcessInfo.processInfo.environment

func fail(_ message: String, code: Int32 = 1) -> Never {
    FileHandle.standardError.write(Data(("omux: " + message + "\n").utf8))
    exit(code)
}

func connect(_ path: String) -> Int32 {
    let fd = socket(AF_UNIX, SOCK_STREAM, 0)
    guard fd >= 0 else { fail("couldn't create a socket") }
    var addr = sockaddr_un()
    addr.sun_family = sa_family_t(AF_UNIX)
    let bytes = Array(path.utf8)
    guard bytes.count < MemoryLayout.size(ofValue: addr.sun_path) else { fail("socket path too long") }
    withUnsafeMutableBytes(of: &addr.sun_path) { raw in
        raw.copyBytes(from: bytes)
        raw[bytes.count] = 0
    }
    let len = socklen_t(MemoryLayout<sockaddr_un>.size)
    let ok = withUnsafePointer(to: &addr) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { Darwin.connect(fd, $0, len) }
    }
    guard ok == 0 else { fail("omux isn't listening (is the command line tool turned on in Settings › Sessions?)", code: 2) }
    return fd
}

func exchange(_ request: CLIRequest, socketPath: String) -> CLIResponse {
    let fd = connect(socketPath)
    defer { close(fd) }
    guard var data = try? JSONEncoder().encode(request) else { fail("couldn't encode the request") }
    data.append(UInt8(ascii: "\n"))
    var sent = 0
    while sent < data.count {
        let n = data.withUnsafeBytes { raw in write(fd, raw.baseAddress! + sent, data.count - sent) }
        guard n > 0 else { fail("omux closed the connection") }
        sent += n
    }
    shutdown(fd, SHUT_WR)
    var reply = Data()
    var buffer = [UInt8](repeating: 0, count: 65536)
    var poller = pollfd(fd: fd, events: Int16(POLLIN), revents: 0)
    // One line of JSON ends the reply; no need to wait for the connection to close.
    while !reply.contains(UInt8(ascii: "\n")) {
        // The app answers from its main thread; a dialog there can hold it up, not forever.
        guard poll(&poller, 1, 15_000) > 0 else { fail("omux didn't answer within 15 seconds (is a dialog open?)", code: 2) }
        let n = read(fd, &buffer, buffer.count)
        if n <= 0 { break }
        reply.append(buffer, count: n)
        if reply.count > 4 << 20 { fail("reply too large") }
    }
    guard let response = try? JSONDecoder().decode(CLIResponse.self, from: reply) else { fail("couldn't read omux's reply") }
    return response
}

func describe(_ session: CLISession) -> String {
    var parts = [session.state]
    if let kind = session.kind { parts.append(kind) }
    if let message = session.message, !message.isEmpty { parts.append(message) }
    let flags = (session.isSelf ? " (this session)" : "") + (session.isChild ? " (started by this session)" : "")
    return "\(session.id)  \(session.name)\(flags)\n  \(session.provider) · \(parts.joined(separator: " · "))" + (session.directory.map { "\n  \($0)" } ?? "")
}

func print(_ response: CLIResponse, json: Bool) {
    if json {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        if let data = try? encoder.encode(response) { Swift.print(String(decoding: data, as: UTF8.self)) }
        return
    }
    if let sessions = response.sessions { Swift.print(sessions.map(describe).joined(separator: "\n")) }
    if let session = response.session { Swift.print(describe(session)) }
    if let screen = response.screen { Swift.print(screen.joined(separator: "\n")) }
}

let parsed: (command: CLICommand, json: Bool)
switch CLIArguments.parse(Array(CommandLine.arguments.dropFirst())) {
case .failure(let error): fail(error.message + "\n" + CLIArguments.usage, code: 64)
case .success(let value): parsed = value
}
if case .help = parsed.command {
    Swift.print(CLIArguments.usage)
    exit(0)
}
guard let socketPath = env["OMUX_SOCKET"], let token = env["OMUX_TOKEN"], let from = env["OMUX_TAB_ID"] else {
    fail("not running inside an omux session (OMUX_SOCKET, OMUX_TOKEN and OMUX_TAB_ID are unset)", code: 2)
}

var command = parsed.command
if case .send(let target, let text, let submit) = command, text == "-" {
    let input = String(decoding: FileHandle.standardInput.readDataToEndOfFile(), as: UTF8.self)
    guard !input.isEmpty else { fail("nothing on stdin") }
    command = .send(target: target, text: input, submit: submit)
}
guard var request = CLIArguments.request(for: command) else { exit(0) }
request.token = token
request.from = from

if case .wait(_, let states, let timeout) = command {
    let deadline = Date().addingTimeInterval(TimeInterval(timeout))
    while true {
        let response = exchange(request, socketPath: socketPath)
        guard response.ok, let session = response.session else {
            print(response, json: parsed.json)
            fail(response.error ?? "no such session")
        }
        if states.contains(session.state) {
            print(response, json: parsed.json)
            exit(0)
        }
        if Date() >= deadline {
            print(response, json: parsed.json)
            fail("timed out after \(timeout)s; the session is \(session.state)", code: 3)
        }
        Thread.sleep(forTimeInterval: 1)
    }
}

let response = exchange(request, socketPath: socketPath)
print(response, json: parsed.json)
if !response.ok { fail(response.error ?? "failed") }
