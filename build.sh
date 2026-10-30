#!/bin/zsh
# Builds omux.app into ./build and installs it in /Applications.
# ./build.sh --beta builds "omux Beta" instead: a separate app with its own
# preferences and workspace, so you can try a branch next to the release build.
set -e
setopt null_glob
cd "$(dirname "$0")"

NAME=omux
BUNDLE_ID=net.pf1.omux
if [[ "$1" == "--beta" ]]; then
  NAME="omux Beta"
  BUNDLE_ID=net.pf1.omux.beta
fi

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
# A stable signing identity keeps macOS from re-asking permissions after each rebuild.
IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep "Apple Development" | head -1 | awk '{print $2}')
codesign --force --sign "${IDENTITY:--}" "$APP" 2>&1 | grep -v "replacing existing signature" || true
# Install to /Applications so Finder's "Open in omux" service and Dock stay registered.
rm -rf "/Applications/$NAME.app"
cp -R "$APP" "/Applications/$NAME.app"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "/Applications/$NAME.app"
/System/Library/CoreServices/pbs -flush 2>/dev/null || true
echo "Built and installed /Applications/$NAME.app ($(du -sh "$APP" | cut -f1))"
