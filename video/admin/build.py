"""Writes index.html with scene starts computed from the narration WAV lengths.

Run after regenerating assets/voice/*.wav:  python build.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
items = json.load(open(os.path.join(HERE, "narration.json"), encoding="utf-8-sig"))
dur = [round((os.path.getsize(os.path.join(HERE, "assets", "voice", i["id"] + ".wav")) - 44) / 48000, 2) for i in items]

# Extra hold per scene: the end card needs a tail.
extra = {12: 1.8}
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
    "Apps › Settings",
    "Settings › Environment groups",
    "Default Environment Group · Rules",
    "Rule · Connectors and MCP servers",
    "Office 365 Outlook › Edit actions",
    "Connector actions · one switch each",
    "Add connectors › Connector catalog",
    "Rule · Sharing",
    "Rule · Content security policy",
    "Apps › All apps",
    "App details › Connectors",
]
chips = "\n".join(
    f'      <div id="chip{k + 1:02d}" class="chip clip" data-start="{S[k + 1]}" data-duration="{scene[k + 1]}" data-track-index="2">{c}</div>'
    for k, c in enumerate(CHIPS)
)

# Propagation note: appears when the scene-7 voice reaches "policy changes can take a while".
NS = round(S[7] + 0.3 + 10.4, 2)
ND = round(S[8] - NS, 2)

html = open(os.path.join(HERE, "index.template.tpl"), encoding="utf-8").read()
html = (
    html.replace("{{TOTAL}}", str(TOTAL))
    .replace("{{S}}", json.dumps(S))
    .replace("{{AUDIO}}", audio)
    .replace("{{CHIPS}}", chips)
    .replace("{{NS}}", str(NS))
    .replace("{{ND}}", str(ND))
    .replace("{{S0}}", str(S[0]))
    .replace("{{D0}}", str(scene[0]))
    .replace("{{S12}}", str(S[12]))
    .replace("{{D12}}", str(scene[12]))
)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("total", TOTAL)
print("S", S)
