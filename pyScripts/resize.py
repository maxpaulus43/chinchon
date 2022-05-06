from PIL import Image
from pathlib import Path
import os

cwd = os.getcwd()

for path in Path("images").glob("*.png"):
    basewidth = 150
    img = Image.open(path)
    wpercent = (basewidth/float(img.size[0]))
    hsize = int((float(img.size[1])*float(wpercent)))
    img = img.resize((basewidth, hsize), Image.ANTIALIAS)
    dest = f'{cwd}/resized/{path.with_suffix(".webp")}'
    img.save(dest, format="webp")
    print(dest)

