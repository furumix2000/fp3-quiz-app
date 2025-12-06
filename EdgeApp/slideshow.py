import os
import tkinter as tk
from PIL import Image, ImageTk
import glob

# --- 設定 ---
# 画像が保存されているフォルダ
IMAGE_FOLDER = 'screenshots'
# 画像を切り替える時間（ミリ秒単位。20秒 = 20000）
SLIDESHOW_DELAY = 20000
# ----------------

class Slideshow(tk.Tk):
    def __init__(self, image_files):
        super().__init__()
        self.title("スライドショー")
        self.geometry("1920x1080") # ウィンドウの大きさ

        self.image_files = image_files
        self.current_image_index = 0

        if not self.image_files:
            print("画像が見つかりません。")
            self.destroy()
            return

        self.label = tk.Label(self)
        self.label.pack(expand=True, fill="both")

        self.show_image()

    def show_image(self):
        # 画像ファイルを開く
        image_path = self.image_files[self.current_image_index]
        try:
            pil_image = Image.open(image_path)
        except FileNotFoundError:
            print(f"画像ファイルが見つかりません: {image_path}")
            self.destroy()
            return

        # ウィンドウサイズに合わせて画像サイズを調整
        # ウィンドウがまだ表示されていない場合があるので、デフォルトサイズを使う
        w = self.winfo_width()
        h = self.winfo_height()
        if w <= 1 or h <= 1:
            w, h = 1920, 1080
        pil_image.thumbnail((w, h), Image.Resampling.LANCZOS)

        # 表示用の画像に変換
        tk_image = ImageTk.PhotoImage(pil_image)

        self.label.config(image=tk_image)
        self.label.image = tk_image # 参照を保持

        # 次の画像へ
        self.current_image_index = (self.current_image_index + 1) % len(self.image_files)

        # 次のタイマーをセット
        self.after(SLIDESHOW_DELAY, self.show_image)

if __name__ == "__main__":
    # 画像フォルダからpngファイルの一覧を取得
    image_list = glob.glob(f"{IMAGE_FOLDER}/*.png")
    image_list.sort() # ファイルを順番通りに並べる

    if image_list:
        app = Slideshow(image_list)
        app.mainloop()
    else:
        print(f"'{IMAGE_FOLDER}' フォルダにスクリーンショットがありません。")
        print("まず capture.py を実行して、スクリーンショットを撮ってください。")