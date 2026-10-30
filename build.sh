#!/bin/zsh
# Builds omux.app into ./build.
#   ./build.sh            builds and installs /Applications/omux.app, signed for development.
#   ./build.sh --beta     builds and installs "omux Beta" instead: a separate app with its own
#                         preferences and workspace, so you can try a branch next to the release build.
#   ./build.sh --dist     builds a distributable release: signed with the Developer ID certificate,
#                         hardened runtime, notarized and stapled; produces build/omux-<version>.dmg
#                         and build/omux-<version>.zip. Doesn't install anything.
#                         Needs a notarytool keychain profile (see NOTARY_PROFILE below).
#   ./build.sh --dist --no-notarize   same, but skips notarization (for checking the build).
set -e
setopt null_glob
cd "$(dirname "$0")"

NAME=omux
BUNDLE_ID=net.pf1.omux
MODE=install
NOTARIZE=1
NOTARY_PROFILE=${NOTARY_PROFILE:-omux-notary}
for arg in "$@"; do
  case "$arg" in
    --beta) NAME="omux Beta"; BUNDLE_ID=net.pf1.omux.beta ;;
    --dist) MODE=dist ;;
    --no-notarize) NOTARIZE=0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

swift build -c release 2>&1 | grep -E "error|warning: unre|Compiling|Build complete" | tail -20

APP="build/$NAME.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/omux "$APP/Contents/MacOS/omux"
cp Info.plist "$APP/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_ID" -c "Set :CFBundleName $NAME" \
  -c "Set :NSServices:0:NSMenuItem:default Open in $NAME" -c "Set :NSServices:0:NSPortName $NAME" "$APP/Contents/Info.plist"
cp Resources/omux.icns "$APP/Contents/Resources/"
for bundle in .build/release/*.bundle; do
  [ -e "$bundle" ] && cp -R "$bundle" "$APP/Contents/Resources/"
done
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist")

if [[ "$MODE" == "install" ]]; then
  # A stable signing identity keeps macOS from re-asking permissions after each rebuild.
  IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep "Apple Development" | head -1 | awk '{print $2}')
  codesign --force --sign "${IDENTITY:--}" "$APP" 2>&1 | grep -v "replacing existing signature" || true
  # Install to /Applications so Finder's "Open in omux" service and Dock stay registered.
  rm -rf "/Applications/$NAME.app"
  cp -R "$APP" "/Applications/$NAME.app"
  /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "/Applications/$NAME.app"
  /System/Library/CoreServices/pbs -flush 2>/dev/null || true
  echo "Built and installed /Applications/$NAME.app ($(du -sh "$APP" | cut -f1))"
  exit 0
fi

# --- Distribution build ---
IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" | head -1 | awk '{print $2}')
if [[ -z "$IDENTITY" ]]; then
  echo "No 'Developer ID Application' certificate in the keychain. Create one in Xcode › Settings › Accounts › Manage Certificates." >&2
  exit 1
fi
if [[ "$NOTARIZE" == 1 ]] && ! xcrun notarytool history --keychain-profile "$NOTARY_PROFILE" >/dev/null 2>&1; then
  cat >&2 <<MSG
No notarytool credentials stored as '$NOTARY_PROFILE'. Store them once (asks for an app-specific
password from account.apple.com › Sign-In and Security › App-Specific Passwords):

  xcrun notarytool store-credentials $NOTARY_PROFILE --apple-id <your Apple ID> --team-id L3DA4MMSS3

Or run with --no-notarize to only sign.
MSG
  exit 1
fi

# Hardened runtime and a secure timestamp are required for notarization.
codesign --force --options runtime --timestamp --sign "$IDENTITY" "$APP"
codesign --verify --strict --deep "$APP"

ARTIFACT="build/${NAME// /-}-$VERSION"
ZIP="$ARTIFACT.zip"
DMG="$ARTIFACT.dmg"
rm -f "$ZIP" "$DMG"

notarize() {
  echo "Notarizing $1…"
  xcrun notarytool submit "$1" --keychain-profile "$NOTARY_PROFILE" --wait 2>&1 | grep -E "status:|id:" | tail -2
}

if [[ "$NOTARIZE" == 1 ]]; then
  ditto -c -k --keepParent "$APP" "$ZIP"
  notarize "$ZIP"
  xcrun stapler staple "$APP" >/dev/null
  rm -f "$ZIP"
fi
# The zip carries the stapled app, so it works offline too.
ditto -c -k --keepParent "$APP" "$ZIP"

# DMG: the app next to an Applications shortcut, so users drag one onto the other.
STAGE=$(mktemp -d)
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "$NAME $VERSION" -srcfolder "$STAGE" -ov -format UDZO -quiet "$DMG"
rm -rf "$STAGE"
codesign --force --timestamp --sign "$IDENTITY" "$DMG"
if [[ "$NOTARIZE" == 1 ]]; then
  notarize "$DMG"
  xcrun stapler staple "$DMG" >/dev/null
fi

echo "Built $DMG ($(du -h "$DMG" | cut -f1)) and $ZIP ($(du -h "$ZIP" | cut -f1))"
[[ "$NOTARIZE" == 1 ]] && spctl --assess --type open --context context:primary-signature -v "$DMG" 2>&1 | tail -1 || true
