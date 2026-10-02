from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent
W, H = 2000, 1120
im = Image.new('RGB', (W, H), '#FFFFFF')
d = ImageDraw.Draw(im)

font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
bold_path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
title = ImageFont.truetype(bold_path, 57)
subtitle = ImageFont.truetype(font_path, 30)
head = ImageFont.truetype(bold_path, 34)
rowfont = ImageFont.truetype(bold_path, 31)
body = ImageFont.truetype(font_path, 27)
small = ImageFont.truetype(font_path, 20)
takeaway = ImageFont.truetype(bold_path, 30)

ink = '#18241D'
muted = '#66716B'
green = '#244D31'
light = '#EAF3ED'
line = '#D7E4DA'

def rr(box, radius, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def lines(text, x, y, font, fill, max_width, gap=8):
    words = text.split()
    rows, current = [], ''
    for word in words:
        candidate = word if not current else current + ' ' + word
        if d.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            current = candidate
        else:
            rows.append(current)
            current = word
    if current:
        rows.append(current)
    for row in rows:
        d.text((x, y), row, font=font, fill=fill)
        y += font.size + gap
    return y

d.text((84, 43), 'Competitive Gaps', font=title, fill=ink)
d.text((86, 115), 'Potential gaps in practice variety, difficulty fit, and continuous guidance', font=subtitle, fill=muted)

# Reuse the exact mark and wordmark from Mojo's approved revenue-model graphic.
source = Image.open(ROOT / 'mojo-revenue-model.png').convert('RGB')
logo = source.crop((1728, 25, 1940, 113))
im.paste(logo, (1704, 36))

x0, x1, x2, x3, x4 = 84, 400, 905, 1410, 1916
top, hh = 198, 86
rr((x0, top, x4, top + hh), 20, '#E9F1EA')
d.text((x0 + 30, top + 22), 'FEATURE', font=head, fill=green)
d.text((x1 + 28, top + 22), 'RUANGGURU', font=head, fill=green)
d.text((x2 + 28, top + 22), 'PAHAMIFY', font=head, fill=green)
d.text((x3 + 28, top + 22), 'MOJO', font=head, fill=green)

rows = [
    ('Practice\nvariety',
     'Prepared banks may repeat; AiRIS practice is flexible but not shown in a skill-led drill flow.',
     'Bank soal and tryouts draw on prepared pools that may feel repetitive with prolonged use.',
     'A large, reviewed mix of real, template-based, and pre-generated AI questions.'),
    ('Difficulty\nfit',
     'Diagnostics guide study; per-question matching to a live skill profile is not shown.',
     'Pegasus adapts recommendations to ability; a skill-weight match for each drill is not clearly documented.',
     'Each question is selected by comparing its skill weights with the learner’s current skill levels.'),
    ('Learning\ndirection',
     'Plans exist, but drill results are not clearly linked to a visual next-step path.',
     'Daily recommendations exist; a continuous path from each result to the next task is not clearly shown.',
     'A Skill Tree turns drill results into a visible next step and a targeted practice goal.'),
    ('AI-guided\nfollow-through',
     'AiRIS is strong for soal explanations; a direct link to a persistent skill path is not documented.',
     'Tanya Mipi explains individual questions; an ongoing, shared coaching context is not documented.',
     'The chatbot uses drill history and the Skill Tree to give relevant hints and guidance.'),
]

row_h = 170
for i, (label, rg, ph, mojo) in enumerate(rows):
    y = top + hh + 15 + i * row_h
    bg = '#F9FBF9' if i % 2 == 0 else '#FFFFFF'
    rr((x0, y, x4, y + row_h - 9), 19, bg, line, 2)
    rr((x3 + 9, y + 8, x4 - 9, y + row_h - 17), 15, '#EFF7F0')
    for xx in (x1, x2, x3):
        d.line((xx, y + 19, xx, y + row_h - 27), fill=line, width=2)
    ly = y + 31
    for part in label.split('\n'):
        d.text((x0 + 29, ly), part, font=rowfont, fill=ink)
        ly += 38
    lines(rg, x1 + 28, y + 30, body, ink, x2 - x1 - 55)
    lines(ph, x2 + 28, y + 30, body, ink, x3 - x2 - 55)
    lines(mojo, x3 + 28, y + 30, body, green, x4 - x3 - 55)

rr((255, 991, 1745, 1050), 30, light)
message = 'Mojo’s proposed edge: varied, skill-matched practice that always leads to a next step.'
bb = d.textbbox((0, 0), message, font=takeaway)
d.text(((W - (bb[2] - bb[0])) / 2, 1003), message, font=takeaway, fill=green)
d.text((85, 1075), 'Sources: Ruangguru AiRIS; Pahamify Pegasus and Tanya Mipi. Potential gaps are inferred from public descriptions; Mojo is proposed.', font=small, fill=muted)

out = ROOT / 'mojo-competitor-comparison.png'
im.save(out, optimize=True)
print(out)
