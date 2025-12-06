import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service

# --- 設定 ---
# Edgeの通訳さん（msedgedriver.exe）の場所を指定
# このファイルと同じフォルダに置いた場合は、このままでOK
DRIVER_PATH = './msedgedriver.exe'

# スクリーンショットを保存するフォルダ名
SAVE_FOLDER = 'screenshots'
# ----------------

# Edgeを起動する準備
service = Service(executable_path=DRIVER_PATH)
driver = webdriver.Edge(service=service)

print("Edgeブラウザを開きました。")
print("スクリーンショットを撮りたいタブを全て開いて、準備ができたらこの黒い画面でEnterキーを押してください...")
input() # ユーザーがEnterキーを押すまで待つ

# 開いているすべてのタブの情報を取得
all_tabs = driver.window_handles
print(f"{len(all_tabs)}個のタブが見つかりました。")

# 各タブのスクリーンショットを撮る
for i, tab in enumerate(all_tabs):
    try:
        # タブを切り替え
        driver.switch_to.window(tab)
        time.sleep(2)  # ページ読み込みと描画を少し長めに待つ

        # ページ全体の高さを取得して、ウィンドウサイズを変更
        total_height = driver.execute_script("return document.body.parentNode.scrollHeight")
        driver.set_window_size(1920, total_height)  # 横幅は1920pxに固定
        time.sleep(1)  # サイズ変更が反映されるのを待つ

        # ファイル名を決める (例: screenshot_1.png)
        filename = f"{SAVE_FOLDER}/screenshot_{i + 1}.png"

        # スクリーンショットを撮って保存
        driver.save_screenshot(filename)
        print(f"タブ{i + 1}のスクリーンショット（ページ全体）を保存しました: {filename}")

    except Exception as e:
        print(f"タブ{i + 1}の撮影中にエラーが起きました: {e}")

# ブラウザを閉じる
driver.quit()
print("全ての撮影が終わったので、ブラウザを閉じました。")