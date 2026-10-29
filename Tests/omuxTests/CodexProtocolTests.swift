import XCTest
@testable import omux

final class CodexProtocolTests: XCTestCase {
    func testWaitingForInputIsNotAToolApproval() {
        let state = CodexStatus.decode(["type": "active", "activeFlags": ["waitingOnUserInput"]])
        XCTAssertEqual(state?.state, .blocked)
        XCTAssertEqual(state?.kind, "question")
    }

    func testUnsupportedPermissionRequestsStayInTheTerminal() {
        XCTAssertNil(CodexApproval(message: ["method": "item/permissions/requestApproval", "id": 1,
                                            "params": ["threadId": "a", "turnId": "t"]]))
    }

    @MainActor
    func testApprovalsAreBoundToTheirThreadAndActiveTurn() {
        let manager = CodexManager()
        let tab = UUID(), other = UUID()
        manager.register(tabID: tab, threadID: "a")
        manager.register(tabID: other, threadID: "b")
        manager.receive(["method": "turn/started", "params": ["threadId": "a", "turn": ["id": "turn-1"]]], owner: tab)
        let approval: [String: Any] = ["id": "request-1", "method": "item/commandExecution/requestApproval",
                                      "params": ["threadId": "a", "turnId": "turn-1", "command": "git status"]]
        manager.receive(approval, owner: other)
        XCTAssertNil(manager.approval(for: tab))
        manager.receive(approval, owner: tab)
        XCTAssertEqual(manager.approval(for: tab)?.id, .string("request-1"))
        XCTAssertNil(manager.approval(for: other))
        manager.receive(["method": "turn/completed", "params": ["threadId": "a", "turn": ["id": "old-turn", "status": "completed"]]], owner: tab)
        XCTAssertNotNil(manager.approval(for: tab))
        manager.receive(["method": "serverRequest/resolved", "params": ["threadId": "a", "requestId": "request-1"]], owner: tab)
        XCTAssertNil(manager.approval(for: tab))
        manager.receive(["method": "turn/completed", "params": ["threadId": "a", "turn": ["id": "turn-1", "status": "completed"]]], owner: tab)
        manager.receive(approval, owner: tab)
        XCTAssertNil(manager.approval(for: tab), "A late request from a completed turn must not become clickable")
    }

    func testConversationIDsAndTimestampsDecodeWithoutUUIDAssumptions() {
        let row = CodexConversation(["id": "opaque-thread", "cwd": "/tmp/project", "name": "Fix login", "updatedAt": 1000])
        XCTAssertEqual(row?.id, "opaque-thread")
        XCTAssertEqual(row?.date, Date(timeIntervalSince1970: 1000))
        XCTAssertNil(CodexConversation(["cwd": "/tmp"]))
    }

    @MainActor
    func testIdenticalRequestIDsFromTwoServersResolveIndependently() {
        let manager = CodexManager(), a = UUID(), b = UUID()
        for (tab, thread) in [(a, "a"), (b, "b")] {
            manager.register(tabID: tab, threadID: thread)
            manager.receive(["method": "turn/started", "params": ["threadId": thread, "turn": ["id": "turn"]]], owner: tab)
            manager.receive(["id": 1, "method": "item/commandExecution/requestApproval",
                             "params": ["threadId": thread, "turnId": "turn", "command": "git status"]], owner: tab)
        }
        manager.receive(["method": "serverRequest/resolved", "params": ["threadId": "a", "requestId": 1]], owner: a)
        XCTAssertNil(manager.approval(for: a))
        XCTAssertNotNil(manager.approval(for: b))
    }

    @MainActor
    func testSparseQuotaUpdatesPreserveOtherWindows() {
        let manager = CodexManager(), tab = UUID()
        manager.receive(["method": "account/rateLimits/updated", "params": ["rateLimits": [
            "primary": ["usedPercent": 10, "windowDurationMins": 300],
            "secondary": ["usedPercent": 30, "windowDurationMins": 10080]
        ]]], owner: tab)
        manager.receive(["method": "account/rateLimits/updated", "params": ["rateLimits": [
            "primary": ["usedPercent": 15]
        ]]], owner: tab)
        XCTAssertEqual(manager.limits.map(\.percent), [15, 30])
        XCTAssertEqual(manager.limits.map(\.label), ["5h", "7d"])
    }

    @MainActor
    func testNewTurnClearsPreviousApprovalAndIgnoresItsLateCompletion() {
        let manager = CodexManager(), tab = UUID()
        manager.register(tabID: tab, threadID: "root")
        manager.receive(["method": "turn/started", "params": ["threadId": "root", "turn": ["id": "old"]]], owner: tab)
        manager.receive(["id": 7, "method": "item/fileChange/requestApproval",
                         "params": ["threadId": "root", "turnId": "old"]], owner: tab)
        XCTAssertNotNil(manager.approval(for: tab))
        manager.receive(["method": "turn/started", "params": ["threadId": "root", "turn": ["id": "new"]]], owner: tab)
        XCTAssertNil(manager.approval(for: tab))
        var last: CodexStatus?
        manager.onStatus = { _, value in last = value }
        manager.receive(["method": "turn/completed", "params": ["threadId": "root", "turn": ["id": "old", "status": "completed"]]], owner: tab)
        XCTAssertNil(last)
    }

    @MainActor
    func testChildApprovalsAppearOnlyUnderTheirParentAndClearOnNewConversation() {
        let manager = CodexManager(), tab = UUID(), other = UUID()
        manager.register(tabID: tab, threadID: "root")
        manager.register(tabID: other, threadID: "other")
        manager.receive(["method": "item/started", "params": ["threadId": "root", "item": [
            "type": "collabAgentToolCall", "receiverThreadIds": ["child"], "prompt": "Inspect tests"
        ]]], owner: tab)
        XCTAssertEqual(manager.agents[tab]?.first?.id, "child")
        manager.receive(["method": "turn/started", "params": ["threadId": "child", "turn": ["id": "child-turn"]]], owner: tab)
        manager.receive(["id": 2, "method": "item/commandExecution/requestApproval", "params": [
            "threadId": "child", "turnId": "child-turn", "command": "git status"
        ]], owner: tab)
        XCTAssertEqual(manager.approval(for: tab)?.threadID, "child")
        XCTAssertNil(manager.approval(for: other))
        var saved: String?
        manager.onThreadChange = { _, id in saved = id }
        manager.receive(["method": "thread/started", "params": ["thread": [
            "id": "new-root", "source": "cli"
        ]]], owner: tab)
        XCTAssertEqual(saved, "new-root")
        XCTAssertNil(manager.approval(for: tab))
        XCTAssertNil(manager.agents[tab])
        XCTAssertEqual(manager.thread(for: other), "other")
    }
    @MainActor
    func testLateChildSubscriptionTracksCompletionWithoutStartedEvent() {
        let manager = CodexManager(), tab = UUID()
        manager.register(tabID: tab, threadID: "root")
        manager.receive(["method": "item/started", "params": ["threadId": "root", "item": [
            "type": "collabAgentToolCall", "receiverThreadIds": ["child"]
        ]]], owner: tab)
        let snapshot: [String: Any] = ["id": "child", "status": ["type": "active"],
                                      "turns": [["id": "active-turn", "status": "inProgress"]]]
        manager.synchronizeAgent(snapshot, owner: tab)
        manager.receive(["method": "turn/completed", "params": ["threadId": "child", "turn": [
            "id": "active-turn", "status": "completed"
        ]]], owner: tab)
        XCTAssertEqual(manager.agents[tab]?.first?.state, "completed")
        // A late resume response must not revive a completed turn.
        manager.synchronizeAgent(snapshot, owner: tab)
        manager.receive(["id": 7, "method": "item/commandExecution/requestApproval", "params": [
            "threadId": "child", "turnId": "active-turn", "command": "git status"
        ]], owner: tab)
        XCTAssertNil(manager.approval(for: tab))
    }

}
