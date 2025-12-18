#!/bin/bash
# Rebuild and install Android app (use after Java/Kotlin changes)

set -e
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

cd "$(dirname "$0")/android" || exit

echo "� Building APK..."
./gradlew assembleDebug

echo "📱 Installing..."
adb install -r app/build/outputs/apk/debug/app-debug.apk

echo "🔄 Restarting app..."
adb shell am force-stop com.interviewapp
adb shell am start -n com.interviewapp/.MainActivity

echo "✅ Done!"
