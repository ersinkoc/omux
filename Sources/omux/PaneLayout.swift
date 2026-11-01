import Foundation
import SwiftUI

/// How sessions are arranged in the main area: one session, or two halves split along an
/// axis, each of which is a layout again. Dividers between halves can be dragged, so a
/// binary tree is enough for any arrangement of columns and rows.
indirect enum PaneLayout: Equatable {
    case session(UUID)
    /// `fraction` is the first half's share of the split, 0.15…0.85.
    case split(axis: Axis, fraction: Double = 0.5, first: PaneLayout, second: PaneLayout)

    static let maxPanes = 6

    /// The sessions in the layout, left to right and top to bottom.
    var ids: [UUID] {
        switch self {
        case .session(let id): return [id]
        case .split(_, _, let first, let second): return first.ids + second.ids
        }
    }

    /// The split at `path` (false: first half, true: second half, from the root) with a new fraction.
    func resizing(_ path: [Bool], to fraction: Double) -> PaneLayout {
        guard case .split(let axis, let old, let first, let second) = self else { return self }
        let clamped = min(max(fraction, 0.15), 0.85)
        guard let step = path.first else { return .split(axis: axis, fraction: clamped, first: first, second: second) }
        let rest = Array(path.dropFirst())
        return step ? .split(axis: axis, fraction: old, first: first, second: second.resizing(rest, to: fraction))
                    : .split(axis: axis, fraction: old, first: first.resizing(rest, to: fraction), second: second)
    }

    func contains(_ id: UUID) -> Bool { ids.contains(id) }

    /// `id`'s pane split along `axis`, with `newID` in the second half (right or below), or the
    /// first half when `before`. Unchanged when `id` isn't in the layout.
    func splitting(_ id: UUID, with newID: UUID, axis: Axis, before: Bool = false) -> PaneLayout {
        switch self {
        case .session(id):
            return before ? .split(axis: axis, first: .session(newID), second: .session(id))
                          : .split(axis: axis, first: .session(id), second: .session(newID))
        case .session:
            return self
        case .split(let a, let fraction, let first, let second):
            return .split(axis: a, fraction: fraction, first: first.splitting(id, with: newID, axis: axis, before: before),
                          second: second.splitting(id, with: newID, axis: axis, before: before))
        }
    }

    /// Without `id`; its sibling takes the whole of their split. nil when `id` was all there was.
    func removing(_ id: UUID) -> PaneLayout? {
        switch self {
        case .session(id): return nil
        case .session: return self
        case .split(let axis, let fraction, let first, let second):
            switch (first.removing(id), second.removing(id)) {
            case (nil, nil): return nil
            case (let a?, nil): return a
            case (nil, let b?): return b
            case (let a?, let b?): return .split(axis: axis, fraction: fraction, first: a, second: b)
            }
        }
    }

    /// `id` moved next to `target`, on the given edge of it.
    func moving(_ id: UUID, to target: UUID, edge: Edge) -> PaneLayout {
        guard id != target, contains(id), contains(target), let without = removing(id) else { return self }
        let axis: Axis = (edge == .leading || edge == .trailing) ? .horizontal : .vertical
        return without.splitting(target, with: id, axis: axis, before: edge == .leading || edge == .top)
    }

    /// Every split back to halves.
    var balanced: PaneLayout {
        switch self {
        case .session: return self
        case .split(let axis, _, let first, let second): return .split(axis: axis, fraction: 0.5, first: first.balanced, second: second.balanced)
        }
    }

    /// Only sessions that still exist; nil when none are left.
    func keeping(_ exists: (UUID) -> Bool) -> PaneLayout? {
        switch self {
        case .session(let id): return exists(id) ? self : nil
        case .split(let axis, let fraction, let first, let second):
            switch (first.keeping(exists), second.keeping(exists)) {
            case (nil, nil): return nil
            case (let a?, nil): return a
            case (nil, let b?): return b
            case (let a?, let b?): return .split(axis: axis, fraction: fraction, first: a, second: b)
            }
        }
    }
}

/// Saved in workspace.json as {"session": id} or {"axis": "horizontal", "first": …, "second": …}.
extension PaneLayout: Codable {
    private enum Keys: String, CodingKey { case session, axis, fraction, first, second }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        if let id = try c.decodeIfPresent(UUID.self, forKey: .session) {
            self = .session(id)
        } else {
            let axis = try c.decode(String.self, forKey: .axis) == "vertical" ? Axis.vertical : .horizontal
            let fraction = min(max(try c.decodeIfPresent(Double.self, forKey: .fraction) ?? 0.5, 0.15), 0.85)
            self = .split(axis: axis, fraction: fraction, first: try c.decode(PaneLayout.self, forKey: .first), second: try c.decode(PaneLayout.self, forKey: .second))
        }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: Keys.self)
        switch self {
        case .session(let id):
            try c.encode(id, forKey: .session)
        case .split(let axis, let fraction, let first, let second):
            try c.encode(axis == .vertical ? "vertical" : "horizontal", forKey: .axis)
            try c.encode(fraction, forKey: .fraction)
            try c.encode(first, forKey: .first)
            try c.encode(second, forKey: .second)
        }
    }
}
