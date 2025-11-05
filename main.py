import pyautogui
import json
import time
import argparse

global_x = 0
global_y = 0

def move_to(action):
    if not "{global}" in action:
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
        print(f"[INFO] Moving to {x}, {y}")
    pyautogui.moveTo(global_x, global_y, duration=duration)

def search_color(action):
    if not "color" in action:
        print("[ERROR] no color to search")
        return
    color = eval(action.get("color"))
    s = pyautogui.screenshot()
    for x in range(s.width):
        for y in range(s.height):
            if s.getpixel((x, y)) == color:
                print("found color")
                pyautogui.click(x, y)
                return   

def click(action):
    button = action.get("button", "left")
    clicks = action.get("clicks", 1)
    interval = action.get("interval", 0)
    print(f"[INFO] Clicking {button}, {clicks} times.")
    pyautogui.click(button=button, clicks=clicks, interval=interval)

def type_text(action):
    if not "text" in action:
        print("[ERROR] text field doesn't exists in type_text action")
        pass
    text = action.get("text")
    interval = action.get("interval", 0)
    print(f"[INFO] Typing {text}.")
    pyautogui.typewrite(text, interval=interval)

def wait_secs(action):
    if not "seconds" in action:
        print("[ERROR] seconds field doesn't exists in wait_secs action")
        pass
    seconds = action.get("seconds")
    print(f"[INFO] Waiting {seconds} seconds.")
    time.sleep(seconds)

def wait_until_color(action):
    if not "color" in action:
        print("[ERROR] no condition in wait_until action")
        return
    while True:
        print("[INFO] checking color...")
        if not "check_x" in action or not "check_y" in action or not "color" in action or not "check_interval" in action:
            print("[ERROR] not enought information to perform checking")
            pass
        check_x = action.get("check_x")
        check_y = action.get("check_y")
        color = action.get("color")
        check_interval = action.get("check_interval")

        if not pyautogui.pixelMatchesColor(check_x, check_y, eval(color)):
            time.sleep(check_interval)
        else: break

actions_set = {
    "MOVE_TO": move_to,
    "CLICK": click,
    "TYPE": type_text,
    "WAIT_SECS": wait_secs,
    "WAIT_UNTIL_COLOR": wait_until_color,
    "SEARCH_SCREEN_COLOR": search_color
}

def iterate_actions(actions, input_value=None):
    for action in actions:
        if input_value is not None and isinstance(action, dict):
            action = {k: (str(v).replace('{input}', str(input_value)) if isinstance(v, str) and '{input}' in v else v) for k, v in action.items()}
        action_type = action.get("action")
        skip = action.get("skip")
        if skip:
            continue
        if not "action" in action:
            print("[ERROR] no action type on action")
            continue
        actions_set[str(action_type)](action)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Executa automação com entradas de um arquivo.')
    parser.add_argument('--input', '-i', type=str, help='Caminho para o arquivo de entrada')
    parser.add_argument('--actions', '-a', type=str, default='actions.json', help='Caminho para o arquivo de ações (default: actions.json)')
    args = parser.parse_args()

    try:
        with open(args.actions, "r") as f:
            actions_data = json.load(f)
            if not "actions" in actions_data:
                print("[Error] The JSON file must contain an 'actions' array.")
                exit(1)
        
        if args.input is None:
            print("Nenhum arquivo de entrada fornecido. Executando automação sem inputs.")
            iterate_actions(actions_data["actions"], None)
        else:
            try:
                with open(args.input, "r") as input_file:
                    lines = [line.strip() for line in input_file if line.strip()]
                    
                if not lines:
                    print("[Warning] Arquivo de entrada vazio.")
                    exit(0)
                    
                for line in lines:
                    print(f"\n--- Executando automação para entrada: {line} ---")
                    iterate_actions(actions_data["actions"], line)
                    
            except FileNotFoundError:
                print(f"[Error] Arquivo de entrada não encontrado: {args.input}")
                exit(1)
            
    except FileNotFoundError:
        print(f"[Error] Arquivo de ações não encontrado: {args.actions}")
        exit(1)
    except json.JSONDecodeError:
        print(f"[Error] Formato JSON inválido em: {args.actions}")
        exit(1)
