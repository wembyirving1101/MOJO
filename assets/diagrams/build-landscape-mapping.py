from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent
W, H = 2000, 1120
im = Image.new('RGB', (W, H), '#FFFFFF')
d = ImageDraw.Draw(im)
regular = '/System/Library/Fonts/Supplemental/Arial.ttf'
bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
F = lambda path, size: ImageFont.truetype(path, size)
title, sub, h, body, sm = F(bold, 57), F(regular, 29), F(bold, 31), F(regular, 26), F(regular, 20)
dark, green, gray = '#1B251F', '#244D31', '#65736B'

def rr(box, radius, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius, fill=fill, outline=outline, width=width)

def centered(text, x, y, font, color):
    b = d.textbbox((0, 0), text, font=font)
    d.text((x - (b[2] - b[0]) / 2, y), text, font=font, fill=color)

def logo_tile(cx, cy, logo, price, width=250):
    height = 144
    rr((cx-width/2, cy-height/2, cx+width/2, cy+height/2), 23, '#FFFFFF', '#C6D9CB', 3)
    mark = logo.convert('RGBA')
    mark = mark.crop(mark.getbbox())
    mark.thumbnail((width-36, 76), Image.Resampling.LANCZOS)
    im.paste(mark, (int(cx-mark.width/2), int(cy-53)), mark)
    centered(price, cx, cy+37, F(bold, 23), green)

d.text((82, 42), 'Market Landscape Mapping', font=title, fill=dark)
d.text((84, 114), 'Price on the horizontal axis; learning-service integration on the vertical axis', font=sub, fill=gray)
source = Image.open(ROOT / 'mojo-revenue-model.png').convert('RGB')
im.paste(source.crop((1728, 25, 1940, 113)), (1704, 36))

px0, py0, px1, py1 = 153, 270, 1345, 890
rr((px0, py0, px1, py1), 24, '#F8FAF8', '#DDE8DF', 2)
rr((px0 + 1, py0 + 1, 840, 575), 20, '#E9F6EB')
d.line((px0, 575, px1, 575), fill='#D8E3DA', width=3)
d.line((840, py0, 840, py1), fill='#D8E3DA', width=3)
d.text((190, 292), 'HIGHER SERVICE INTEGRATION', font=F(bold, 23), fill='#558565')
d.text((190, 846), 'LOWER SERVICE INTEGRATION', font=F(bold, 23), fill='#789181')

axis_font = F(bold, 23)
vertical = Image.new('RGBA', (650, 43), (255, 255, 255, 0))
vd = ImageDraw.Draw(vertical)
vd.text((0, 2), 'Y-AXIS  •  SERVICE INTEGRATION', font=axis_font, fill=green)
vertical = vertical.crop(vertical.getbbox()).rotate(90, expand=True)
im.paste(vertical, (47, int((py0+py1-vertical.height)/2)), vertical)

# The y positions communicate qualitative, illustrative positioning only.
def xpos(price):
    return px0 + 55 + (price / 140000) * (px1 - px0 - 110)

mx = (xpos(49000) + xpos(79000))/2
rr((mx-125, 343, mx+125, 527), 23, '#FFFFFF', '#C6D9CB', 3)
mascot = Image.open(ROOT / 'mojo-mascot-logo.png').convert('RGB')
mascot = mascot.resize((116, 108), Image.Resampling.LANCZOS)
im.paste(mascot, (int(mx-58), 356))
centered('Rp49–79k/mo', mx, 480, F(bold, 23), green)

qx = xpos(126000)
logo_tile(qx, 623, Image.open(ROOT / 'pahamify-logo.png'), 'Rp126k/mo', 260)

rx = xpos(43250)
logo_tile(rx, 695, Image.open(ROOT / 'ruangguru-logo.png'), '~Rp43.25k/mo*', 280)
centered('Rp519k paid upfront', rx, 779, F(regular, 21), gray)

d.text((155, 911), 'Lower monthly equivalent', font=F(bold, 23), fill=dark)
right = 'Higher monthly equivalent'
b = d.textbbox((0, 0), right, font=F(bold, 23))
d.text((1345 - (b[2]-b[0]), 911), right, font=F(bold, 23), fill=dark)
centered('X-AXIS  •  PRICE (Rp/month equivalent)', (px0+px1)/2, 952, F(bold, 23), green)

rx0, rx1 = 1415, 1920
rr((rx0, 270, rx1, 557), 24, '#EAF4EC')
d.text((rx0+32, 300), 'Mojo’s proposed position', font=h, fill=green)
d.text((rx0+32, 359), 'Monthly flexibility', font=F(bold, 28), fill=dark)
d.text((rx0+32, 397), 'plus a connected cycle of', font=body, fill=dark)
d.text((rx0+32, 434), 'skill path, practice, feedback,', font=body, fill=dark)
d.text((rx0+32, 471), 'and chatbot guidance.', font=body, fill=dark)

rr((rx0, 583, rx1, 889), 24, '#F6F8F6', '#DDE8DF', 2)
d.text((rx0+32, 614), 'Projection at 1,000 users', font=h, fill=green)
d.text((rx0+32, 676), 'Rp17.7M', font=F(bold, 51), fill=dark)
d.text((rx0+32, 741), 'monthly revenue', font=body, fill=gray)
d.text((rx0+32, 796), '28.9% contribution margin', font=F(bold, 26), fill=green)
d.text((rx0+32, 833), 'before other operating costs', font=F(regular, 22), fill=gray)

rr((230, 997, 1770, 1057), 30, '#EAF3ED')
message = 'Mojo pairs monthly flexibility with a proposed integrated learning experience'
centered(message, 1000, 1011, F(bold, 30), green)
d.text((83, 1081), '*Ruangguru monthly equivalent = Rp519,000 ÷ 12; annual package paid upfront. Prices supplied for proposal; guidance positions are illustrative.', font=sm, fill=gray)

out = ROOT / 'mojo-market-landscape.png'
im.save(out, optimize=True)
print(out)
