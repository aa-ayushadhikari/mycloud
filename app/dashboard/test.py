import time
from pywinauto import Application, findwindows

# Regex to match any VS Code window
TARGET_WINDOW_TITLE = ".*Visual Studio Code.*"

# 1) Find the VS Code window handle
handles = findwindows.find_windows(title_re=TARGET_WINDOW_TITLE, backend="win32")
if not handles:
    raise RuntimeError("No VS Code window found!")
hwnd = handles[0]

# 2) Attach via Win32 backend
app = Application(backend="win32").connect(handle=hwnd)
window = app.window(handle=hwnd)

print(f"Background automation started on VS Code (hwnd={hwnd})")
print("Press Ctrl+C in terminal to stop.")

try:
    while True:
        # Select All
        window.send_keystrokes('{VK_CONTROL down}a{VK_CONTROL up}')
        time.sleep(0.05)

        # Copy
        window.send_keystrokes('{VK_CONTROL down}c{VK_CONTROL up}')
        time.sleep(0.05)

        # Select All again
        window.send_keystrokes('{VK_CONTROL down}a{VK_CONTROL up}')
        time.sleep(0.05)

        # Delete
        window.send_keystrokes('{DEL}')
        time.sleep(0.05)

        # Paste
        window.send_keystrokes('{VK_CONTROL down}v{VK_CONTROL up}')
        time.sleep(0.05)

        # Save
        window.send_keystrokes('{VK_CONTROL down}s{VK_CONTROL up}')
        time.sleep(0.05)

        print("Cycle complete. Waiting 60 seconds…")
        time.sleep(60)

except KeyboardInterrupt:
    print("Stopped by user.")
