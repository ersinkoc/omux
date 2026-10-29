import SwiftUI

/// One compact line of Claude limits: `5h 1%  Week 32%  Fable 35%`, each with a
/// hairline bar. Hovering a limit swaps its text for the reset time.
struct UsageView: View {
    @EnvironmentObject var store: Store
    @StateObject private var monitor = UsageMonitor()
    @ObservedObject private var codex = CodexManager.shared
    @State private var hovered: String?
    @AppStorage(Prefs.usageInterval) private var usageInterval = 300.0

    private var isCodex: Bool { store.selectedProvider == .codex }
    private var limits: [UsageMonitor.Limit] {
        isCodex ? codex.limits : store.selectedProvider == .claude ? monitor.limits : []
    }

    var body: some View {
        HStack(spacing: 10) {
            Text(store.selectedProvider.label).font(.caption2).foregroundStyle(.tertiary)
            if limits.isEmpty {
                Text(isCodex ? codex.usageError ?? "Start a Codex session to see usage" : store.selectedProvider == .claude ? monitor.error ?? "Claude usage…" : "")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            ForEach(limits) { limit in
                VStack(alignment: .leading, spacing: 2) {
                    Text(hovered == limit.id ? limit.resetText : "\(limit.label) \(limit.percent)%")
                        .font(.caption2.monospacedDigit())
                        .foregroundStyle(hovered == limit.id ? .primary : .secondary)
                        .lineLimit(1)
                        .fixedSize()
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(.quaternary)
                            Capsule().fill(limit.tint)
                                .frame(width: geo.size.width * CGFloat(min(limit.percent, 100)) / 100)
                        }
                    }
                    .frame(height: 3)
                }
                .onHover { hovered = $0 ? limit.id : nil }
                .help(limit.resetText)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .onAppear { refreshProvider() }
        .onDisappear { monitor.stop() }
        .onChange(of: usageInterval) { _, seconds in
            if store.selectedProvider == .claude { monitor.schedule(every: seconds) }
        }
        .onChange(of: store.selectedProvider) { _, _ in refreshProvider() }
        .onReceive(Timer.publish(every: usageInterval, on: .main, in: .common).autoconnect()) { _ in
            if isCodex { Task { await codex.refreshUsage() } }
        }
    }

    private func refreshProvider() {
        if store.selectedProvider != .claude {
            monitor.stop()
            if isCodex { Task { await codex.refreshUsage() } }
        } else { monitor.start() }
    }
}
