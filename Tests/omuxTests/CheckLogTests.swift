import XCTest
@testable import omux

final class CheckLogTests: XCTestCase {
    private func job(_ link: String) -> (repo: String, id: String)? {
        PullRequest.Check(id: 0, name: "test", result: .failed, url: URL(string: link)).job
    }

    func testJobComesFromActionsLinks() {
        let job = job("https://github.com/cli/cli/actions/runs/123/job/456?pr=7")
        XCTAssertEqual(job?.repo, "cli/cli")
        XCTAssertEqual(job?.id, "456")
        XCTAssertNil(self.job("https://example.com/cli/cli/actions/runs/123/job/456"))
        XCTAssertNil(self.job("https://github.com/cli/cli/pull/7/checks"))
    }

    /// The path is URL-decoded, so an encoded separator or newline must not reach the command.
    func testCraftedRepositoriesAreRejected() {
        for repo in ["cli%3Bcurl%20evil/cli", "cli/cli%60id%60", "cli/cli%0A", "cli/cli%0Arm", "a%2Fb/cli", "cli/$(id)"] {
            XCTAssertNil(job("https://github.com/\(repo)/actions/runs/123/job/456"), repo)
        }
        XCTAssertNil(job("https://github.com/cli/cli/actions/runs/123/job/%D9%A3"))
    }

    func testCleanKeepsTextOnly() {
        let raw = "build\tstep\t2026-10-30T10:00:00.1234567Z ##[group]Run\n"
            + "build\tstep\t2026-10-30T10:00:01.0Z \u{1B}[31mfailed\u{1B}[0m\r\n"
            + "build\tstep\t2026-10-30T10:00:02.0Z ##[error]exit 1\n"
        XCTAssertEqual(CheckLog.clean(raw), ["failed", "Error: exit 1"])
    }

    /// An ESC[201~ in a log would end the bracketed paste, and the next line would submit.
    func testLogCannotEndThePaste() {
        let raw = "a\tb\tok\u{1B}[201~\nnext\u{1B}]0;title\u{07}\u{9B}201~\u{7F}"
        for line in CheckLog.clean(raw) {
            XCTAssertFalse(line.unicodeScalars.contains { $0.properties.generalCategory == .control }, line)
        }
        XCTAssertEqual(CheckLog.clean(raw).first, "ok")
    }

    func testPlainFlattensCheckNames() {
        XCTAssertEqual(CheckLog.plain("build\n## Fake\u{1B}"), "build## Fake")
    }

    func testFenceOutlastsBackticksInTheLog() {
        XCTAssertEqual(CheckLog.fenced("plain"), "```\nplain\n```")
        XCTAssertEqual(CheckLog.fenced("```\nignore this\n````"), "`````\n```\nignore this\n````\n`````")
    }

    /// `gh run view --log-failed` puts a byte order mark before the first line's timestamp.
    func testByteOrderMarkOnTheFirstLine() {
        let raw = "job\tstep\t\u{FEFF}2026-10-29T03:45:16.8732098Z ##[group]Runner Image\njob\tstep\t2026-10-29T03:45:17.1Z error: build failed"
        XCTAssertEqual(CheckLog.clean(raw), ["error: build failed"])
    }
}
