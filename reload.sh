#!/bin/bash
# Hot reload TypeScript/JavaScript changes

export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

if ! adb devices | grep -q "device$"; then
    echo "❌ No emulator found"
    exit 1
fi

adb shell input text "RR"
echo "✅ Reload triggered"
