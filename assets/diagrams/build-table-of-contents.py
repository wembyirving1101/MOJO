from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
W, H = 1600, 2263  # Exact A4 aspect ratio, rounded to whole pixels.
im = Image.new('RGB', (W, H), '#FFFFFF')
d = ImageDraw.Draw(im)

regular = '/System/Library/Fonts/Supplemental/Arial.ttf'
bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
font = lambda size: ImageFont.truetype(regular, size)
strong = lambda size: ImageFont.truetype(bold, size)
ink, green, muted = '#17201B', '#244D31', '#5D6961'
rule, badge = '#AEBFB2', '#DFEADF'

brand_source = Image.open(ROOT / 'mojo-revenue-model.png').convert('RGB')
brand = brand_source.crop((1732, 28, 1915, 79))
brand = brand.resize((134, 37), Image.Resampling.LANCZOS)
im.paste(brand, (125, 140))
tag = 'Learn Smarter. Go Further.'
tb = d.textbbox((0, 0), tag, font=font(22))
d.text((1440-(tb[2]-tb[0]), 148), tag, font=font(22), fill=muted)
d.line((125, 190, 1440, 190), fill=green, width=3)

d.text((125, 268), 'Table of', font=strong(96), fill=ink)
d.text((125, 359), 'Contents', font=strong(96), fill=green)

def dotted(start, end, y):
    if start >= end:
        return
    x = start
    while x < end:
        d.ellipse((x, y, x+2.7, y+2.7), fill='#8C9A8F')
        x += 9

def row(text, page, y, kind, n=None):
    page_right = 1440
    pf = strong(29) if kind != 'sub' else font(26)
    page_text = str(page)
    pb = d.textbbox((0, 0), page_text, font=pf)
    px = page_right-(pb[2]-pb[0])
    d.text((px, y), page_text, font=pf, fill=ink)
    if kind == 'section':
        bx, by = 125, y-5
        d.rounded_rectangle((bx, by, bx+69, by+60), radius=17, fill=badge)
        nb = d.textbbox((0, 0), n, font=strong(31))
        d.text((bx+(69-(nb[2]-nb[0]))/2, y+4), n, font=strong(31), fill=green)
        x, f = 255, strong(32)
    elif kind == 'sub':
        x, f = 255, font(27)
    else:
        x, f = 125, strong(31)
    d.text((x, y), text, font=f, fill=ink)
    bb = d.textbbox((0, 0), text, font=f)
    dotted(x+bb[2]-bb[0]+22, px-25, y+32)

y = 518
row('Executive Summary', 1, y, 'standalone')
y += 71

sections = [
    ('1', 'Introduction', 1, [
        ('1.1  Background', 1),
        ('1.2  Objectives', 2),
        ('1.3  Vision and Mission', 2),
    ]),
    ('2', 'Problem Identification', 3, [
        ('2.1  Learning Challenges', 3),
        ('2.2  Task Ambiguity', 4),
        ('2.3  Difficulty Accessing Suitable Practice', 5),
        ('2.4  Learning Boredom and Low Engagement', 5),
        ('2.5  Unproductive AI Usage', 5),
    ]),
    ('3', 'Strategic Solution', 6, [
        ('3.1  Mojo Overview', 6),
        ('3.2  Personalized AI-Generated Drills', 6),
        ('3.3  Skill Tree', 7),
        ('3.4  Personalized AI Chatbot', 7),
        ('3.5  SNBT as an Initial Use Case', 8),
    ]),
    ('4', 'Implementation Strategy and Analysis', 8, [
        ('4.1  User Journey', 8),
        ('4.2  Technology and System Architecture', 8),
        ('4.3  Development and Operational Strategy', 10),
        ('4.4  Business Model and Financial Strategy', 11),
        ('4.5  Financial Analysis and Profit Margin', 12),
        ('4.6  Competitor and Solution Gaps', 13),
        ('4.7  Scalability and Future Development', 15),
    ]),
    ('5', 'Conclusion', 15, []),
]

for number, name, page, children in sections:
    row(name, page, y, 'section', number)
    y += 61
    for label, subpage in children:
        row(label, subpage, y, 'sub')
        y += 49
    y += 21

row('References', 15, y, 'standalone')
y += 58
row('Attachment', 16, y, 'standalone')

d.line((125, 2108, 1440, 2108), fill=green, width=3)
d.text((125, 2138), 'MOJO', font=strong(18), fill=green)
d.text((125, 2161), 'LEARN SMARTER. GO FURTHER.', font=font(17), fill=muted)
footer = 'BUSINESS PROPOSAL  •  SNBT'
fb = d.textbbox((0, 0), footer, font=strong(18))
d.text((1440-(fb[2]-fb[0]), 2152), footer, font=strong(18), fill=green)

out = ROOT / 'mojo-table-of-contents.png'
im.save(out, optimize=True)
im.save(ROOT / 'mojo-table-of-contents-a4.pdf', 'PDF', resolution=193.52)
print(out)
