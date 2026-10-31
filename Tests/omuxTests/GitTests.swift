import XCTest
@testable import omux

final class GitTests: XCTestCase {
    /// A commit hook can print far more than a pipe holds to stderr; reading stdout
    /// first used to block forever.
    func testLargeStderrDoesNotHang() {
        let finished = expectation(description: "git returned")
        var result: Git.Result?
        DispatchQueue.global().async {
            result = Git.run(["-c", "alias.noisy=!head -c 200000 /dev/zero | tr '\\0' x >&2; echo done", "noisy"],
                             in: NSTemporaryDirectory())
            finished.fulfill()
        }
        wait(for: [finished], timeout: 15)
        XCTAssertEqual(result?.out, "done\n")
        XCTAssertEqual(result?.err.count, 200_000)
    }

    func testTypeChangeDiffSkipsTheSecondFileHeader() {
        let diff = """
        diff --git a/link b/link
        deleted file mode 120000
        --- a/link
        +++ /dev/null
        @@ -1 +0,0 @@
        -target
        \\ No newline at end of file
        diff --git a/link b/link
        new file mode 100644
        --- /dev/null
        +++ b/link
        @@ -0,0 +1,2 @@
        +one
        +two

        """
        let lines = Git.parseDiff(diff).filter { $0.kind != .hunk }
        XCTAssertEqual(lines.map(\.text), ["target", "one", "two"])
        XCTAssertEqual(lines.map(\.newNumber), [nil, 1, 2])
    }

    /// Once a pull request is merged, ⌘W and Delete Worktree compare the branch with the
    /// pull request's last commit, so work committed after the merge isn't deleted unannounced.
    func testCommitsAfterTheMergedHead() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("omux-after-\(UUID().uuidString)").path
        try FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(atPath: dir) }
        let git = { (args: [String]) in Git.run(["-c", "user.name=t", "-c", "user.email=t@t"] + args, in: dir) }
        XCTAssertTrue(git(["init", "-q", "-b", "work"]).ok)
        XCTAssertTrue(git(["commit", "-q", "--allow-empty", "-m", "pr"]).ok)
        let head = git(["rev-parse", "HEAD"]).out.trimmingCharacters(in: .whitespacesAndNewlines)
        XCTAssertEqual(Git.commitCount(after: head, on: "work", in: dir), 0)
        XCTAssertTrue(git(["commit", "-q", "--allow-empty", "-m", "after the merge"]).ok)
        XCTAssertEqual(Git.commitCount(after: head, on: "work", in: dir), 1)
        XCTAssertNil(Git.commitCount(after: String(repeating: "ab", count: 20), on: "work", in: dir))
        XCTAssertNil(Git.commitCount(after: "-D", on: "work", in: dir))
    }

    func testSlugIsAValidBranchName() {
        XCTAssertEqual(Git.slug("Fix the login bug"), "fix-the-login-bug")
        XCTAssertEqual(Git.slug("Refactor... auth"), "refactor.-auth")
        XCTAssertEqual(Git.slug("docs //notes"), "docs-/notes")
        XCTAssertEqual(Git.slug("foo /.hidden"), "foo-/hidden")
    }
}
