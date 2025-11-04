import pyautogui
import json
import time

global_x = 0
global_y = 0

def move_to(action):
    if not "x" in action:
        print("[ERROR] X field doesn't exists in move_to action")
        pass
    x = action.get("x")
    if not "y" in action:
        print("[ERROR] Y field doesn't exists in move_to action")
        pass
    y = action.get("y")
    duration = action.get("duration", 0)
    global_x = x
    global_y = y
    pyautogui.moveTo(global_x, global_y, duration=duration)

def click(action):
    button = action.get("button", "left")
    clicks = action.get("clicks", 1)
    interval = action.get("interval", 0)
    pyautogui.click(button=button, clicks=clicks, interval=interval)

def type_text(action):
    if not "text" in action:
        print("[ERROR] text field doesn't exists in type_text action")
        pass
    text = action.get("text")
    interval = action.get("interval", 0)
    pyautogui.typewrite(text, interval=interval)

def wait_secs(action):
    if not "seconds" in action:
        print("[ERROR] seconds field doesn't exists in wait_secs action")
        pass
    seconds = action.get("seconds")
    time.sleep(seconds)

def wait_until_color(action):
    if not "equals" in action:
        print("[ERROR] no condition in wait_until action")
        pass
    while True:
        if not "check_x" in action or not "check_y" in action or not "color" in action or not "check_interval" in action:
            print("[ERROR] not enought information to perform checking")
            pass
        check_x = action.get("check_x")
        check_y = action.get("check_y")
        color = action.get("color")
        check_interval = action.get("check_interval")

        if not pyautogui.pixelMatchesColor(check_x, check_y, color):
            time.sleep(check_interval)
        else: break

actions = {
    "MOVE_TO": move_to,
    "CLICK": click,
    "TYPE": type_text,
    "WAIT_SECS": wait_secs,
    "WAIT_UNTIL_COLOR": wait_until_color
}

def iterate_actions(actions):
    for action in actions:
        action_type = action.get("action")
        skip = action.get("skip")
        if skip:
            continue
        if not "action" in action:
            print("[ERROR] no action type on action")
            continue
        actions[action_type](action)

if __name__ == "__main__":
    try:
        with open("actions.json", "r") as f:
            actions_data = json.load(f)
            if "actions" in actions_data:
                iterate_actions(actions_data["actions"])
            else:
                print("[Error] The JSON file must contain an 'actions' array.")
    except FileNotFoundError:
        print("[Error] actions.json not found.")
    except json.JSONDecodeError:
        print("[Error] Invalid JSON format in actions.json.")
