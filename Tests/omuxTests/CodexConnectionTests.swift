import XCTest
@testable import omux

final class CodexConnectionTests: XCTestCase {
    /// Opt-in: starts the installed CLI with a temporary CODEX_HOME and no real
    /// credentials. No model turn is sent and no user conversations are read.
    @MainActor
    func testRealServerPersistsAndResumesExactThread() async throws {
        guard ProcessInfo.processInfo.environment["OMUX_CODEX_INTEGRATION"] == "1" else {
            throw XCTSkip("Set OMUX_CODEX_INTEGRATION=1 to test the installed Codex CLI")
        }
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: folder) }
        try """
        model_provider = "omux_test"
        model = "gpt-6.1-sol"
        [model_providers.omux_test]
        name = "Local test"
        base_url = "http://127.0.0.1:1/v1"
        wire_api = "responses"
        requires_openai_auth = false
        supports_websockets = false
        """.write(to: folder.appendingPathComponent("config.toml"), atomically: true, encoding: .utf8)
        var env = ProcessInfo.processInfo.environment
        env["CODEX_HOME"] = folder.path
        env.removeValue(forKey: "OPENAI_API_KEY")
        env.removeValue(forKey: "CODEX_API_KEY")
        let connection = CodexConnection(environment: env)
        defer { connection.close() }
        try await connection.connect()
        let one = try await connection.request("thread/start", params: ["cwd": folder.path])
        let first = try XCTUnwrap((one["thread"] as? [String: Any])?["id"] as? String)
        _ = try await connection.request("thread/name/set", params: ["threadId": first, "name": "Omux integration test"])
        let two = try await connection.request("thread/start", params: ["cwd": folder.path])
        let second = try XCTUnwrap((two["thread"] as? [String: Any])?["id"] as? String)
        _ = try await connection.request("thread/name/set", params: ["threadId": second, "name": "Second Omux test"])
        XCTAssertNotEqual(first, second)
        connection.close()
        try await connection.connect()
        let resumed = try await connection.request("thread/resume", params: ["threadId": first, "excludeTurns": true])
        XCTAssertEqual((resumed["thread"] as? [String: Any])?["id"] as? String, first)
        let other = try await connection.request("thread/resume", params: ["threadId": second, "excludeTurns": true])
        XCTAssertEqual((other["thread"] as? [String: Any])?["id"] as? String, second)
        let independent = CodexConnection(environment: env)
        defer { independent.close() }
        try await independent.connect()
        let separate = try await independent.request("thread/start", params: ["cwd": folder.path])
        let third = try XCTUnwrap((separate["thread"] as? [String: Any])?["id"] as? String)
        _ = try await independent.request("thread/name/set", params: ["threadId": third, "name": "Independent Omux test"])
        connection.close()
        let stillAvailable = try await independent.request("thread/read", params: ["threadId": third])
        XCTAssertEqual((stillAvailable["thread"] as? [String: Any])?["id"] as? String, third,
                       "Closing one Omux server must not stop an independent server")
    }
}
