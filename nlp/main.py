from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from PIL import Image, ImageFilter, ImageDraw
import re
import base64
import json

app = FastAPI(title="CREOLE NLP", version="0.2.0")

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")
ID_RE = re.compile(r"\b\d{6,}\b")  # generic long number
SACRED_TERMS = ["lwa", "ginen", "asogwe"]  # demo list; extend via config

class RedactReq(BaseModel):
    text: str
    extra_terms: Optional[List[str]] = None

class TranslateReq(BaseModel):
    text: str
    src: str = "ht"
    dest: str = "en"

@app.get("/health")
def health():
    return {"status":"ok"}

@app.post("/redact_text")
def redact_text(req: RedactReq):
    text = req.text
    def mask(m): return "[REDACTED]"
    text = EMAIL_RE.sub(mask, text)
    text = PHONE_RE.sub(mask, text)
    text = ID_RE.sub(mask, text)
    # mask sacred terms (basic, case-insensitive, word-boundary loose)
    terms = (req.extra_terms or []) + SACRED_TERMS
    for t in terms:
        if not t: continue
        pattern = re.compile(re.escape(t), re.IGNORECASE)
        text = pattern.sub("[REDACTED]", text)
    return {"redacted": text}

@app.post("/translate")
def translate(req: TranslateReq):
    # MVP stub
    return {"translation": f"[{req.src}->{req.dest}] {req.text}"}

@app.post("/redact_image")
async def redact_image(file: UploadFile = File(...), regions: str = Form("[]")):
    """Apply box blur on provided regions. regions = JSON [[x,y,w,h],...] in relative coords (0..1)."""
    raw = await file.read()
    im = Image.open(BytesIO(raw)).convert("RGBA")
    try:
        boxes = json.loads(regions)
        if not isinstance(boxes, list): boxes = []
    except Exception:
        boxes = []
    out = im.copy()
    draw = ImageDraw.Draw(out)
    W, H = im.size
    for box in boxes:
        if not (isinstance(box, list) and len(box)==4): continue
        x,y,w,h = box
        x0,y0,x1,y1 = int(x*W), int(y*H), int((x+w)*W), int((y+h)*H)
        crop = out.crop((x0,y0,x1,y1)).filter(ImageFilter.GaussianBlur(radius=12))
        out.paste(crop, (x0,y0))
        draw.rectangle((x0,y0,x1,y1), outline=(255,0,0,128), width=2)
    buf = BytesIO()
    out.save(buf, format="PNG")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")
    return {"image_base64": b64, "format": "png", "boxes": boxes}