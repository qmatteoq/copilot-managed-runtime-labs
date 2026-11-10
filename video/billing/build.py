"""Writes index.html with scene starts computed from the narration WAV lengths.

Run after regenerating assets/voice/*.wav:  python build.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
items = json.load(open(os.path.join(HERE, "narration.json"), encoding="utf-8-sig"))
dur = [round((os.path.getsize(os.path.join(HERE, "assets", "voice", i["id"] + ".wav")) - 44) / 48000, 2) for i in items]

# Extra hold per scene: the review scene needs room for the click, the end card needs a tail.
extra = {9: 1.4, 11: 1.8}
S, t = [], 0.0
for k, d in enumerate(dur):
    S.append(round(t, 2))
    t += d + 1.2 + extra.get(k, 0)
TOTAL = round(t, 2)
scene = [round((S[k + 1] if k + 1 < len(S) else TOTAL) - S[k], 2) for k in range(len(S))]

audio = "\n".join(
    f'      <audio id="vo{k + 1:02d}" class="clip" src="assets/voice/{it["id"]}.wav" data-start="{round(S[k] + 0.3, 2)}" data-duration="{dur[k]}" data-track-index="10"></audio>'
    for k, it in enumerate(items)
)

CHIPS = [
    "Copilot › Cost management",
    "Configuration › Add spending policy",
    "Step 1 of 6 · Policy scope",
    "Step 2 of 6 · Agents and services",
    "Step 3 of 6 · Limits and alerts",
    "Step 3 of 6 · Limits and alerts",
    "Step 4 of 6 · Model template",
    "Step 5 of 6 · Billing method",
    "Step 6 of 6 · Review and add policy",
    "Done · Policy enabled",
]
chips = "\n".join(
    f'      <div id="chip{k + 1:02d}" class="chip clip" data-start="{S[k + 1]}" data-duration="{scene[k + 1]}" data-track-index="2">{c}</div>'
    for k, c in enumerate(CHIPS)
)

html = open(os.path.join(HERE, "index.template.tpl"), encoding="utf-8").read()
html = (
    html.replace("{{TOTAL}}", str(TOTAL))
    .replace("{{S}}", json.dumps(S))
    .replace("{{AUDIO}}", audio)
    .replace("{{CHIPS}}", chips)
    .replace("{{S0}}", str(S[0]))
    .replace("{{D0}}", str(scene[0]))
    .replace("{{S11}}", str(S[11]))
    .replace("{{D11}}", str(scene[11]))
)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("total", TOTAL)
print("S", S)
