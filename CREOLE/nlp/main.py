from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re
import base64
import io
import json
from PIL import Image, ImageFilter
import numpy as np

app = FastAPI(title="CREOLE NLP Service", version="1.0.0")

# Sacred/sensitive terms for redaction
SACRED_TERMS = [
    "lwa", "ginen", "asogwe", "houngan", "mambo", 
    "veve", "peristil", "poto mitan", "djevo", "kanzo"
]

class RedactTextRequest(BaseModel):
    text: str
    extra_terms: Optional[List[str]] = []

class RedactTextResponse(BaseModel):
    redacted_text: str
    masked_count: int

class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

class TranslateResponse(BaseModel):
    translated_text: str
    confidence: float

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "nlp"}

@app.post("/redact_text", response_model=RedactTextResponse)
async def redact_text(request: RedactTextRequest):
    """
    Redact sensitive information from text including:
    - Email addresses
    - Phone numbers
    - Long numeric IDs
    - Sacred/sensitive terms
    """
    text = request.text
    masked_count = 0
    
    # Combine sacred terms with extra terms
    sensitive_terms = SACRED_TERMS + (request.extra_terms or [])
    
    # Redact email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_matches = len(re.findall(email_pattern, text))
    text = re.sub(email_pattern, '[EMAIL_REDACTED]', text)
    masked_count += email_matches
    
    # Redact phone numbers (various formats)
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # US format
        r'\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b',  # International
        r'\b\d{10,}\b',  # Long numbers
    ]
    for pattern in phone_patterns:
        phone_matches = len(re.findall(pattern, text))
        text = re.sub(pattern, '[PHONE_REDACTED]', text)
        masked_count += phone_matches
    
    # Redact long numeric IDs (more than 8 digits)
    id_pattern = r'\b\d{9,}\b'
    id_matches = len(re.findall(id_pattern, text))
    text = re.sub(id_pattern, '[ID_REDACTED]', text)
    masked_count += id_matches
    
    # Redact sacred/sensitive terms
    for term in sensitive_terms:
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        term_matches = len(pattern.findall(text))
        text = pattern.sub('[SACRED_TERM]', text)
        masked_count += term_matches
    
    # Redact credit card-like numbers
    cc_pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    cc_matches = len(re.findall(cc_pattern, text))
    text = re.sub(cc_pattern, '[CARD_REDACTED]', text)
    masked_count += cc_matches
    
    # Redact SSN-like patterns
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    ssn_matches = len(re.findall(ssn_pattern, text))
    text = re.sub(ssn_pattern, '[SSN_REDACTED]', text)
    masked_count += ssn_matches
    
    return RedactTextResponse(
        redacted_text=text,
        masked_count=masked_count
    )

@app.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    """
    Stub translation endpoint
    In production, this would integrate with a translation service
    """
    # This is a stub implementation
    return TranslateResponse(
        translated_text=f"[TRANSLATION_STUB: {request.source_lang} to {request.target_lang}] {request.text}",
        confidence=0.0
    )

@app.post("/redact_image")
async def redact_image(
    file: UploadFile = File(...),
    regions: str = Form(...)
):
    """
    Apply Gaussian blur to specified regions of an image
    Regions format: [[x, y, width, height], ...] in relative coordinates (0-1)
    """
    try:
        # Parse regions JSON
        try:
            regions_list = json.loads(regions)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid regions JSON")
        
        # Read and open image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get image dimensions
        img_width, img_height = image.size
        
        # Apply blur to each region
        for region in regions_list:
            if len(region) != 4:
                continue
                
            # Convert relative coordinates to absolute
            x = int(region[0] * img_width)
            y = int(region[1] * img_height)
            w = int(region[2] * img_width)
            h = int(region[3] * img_height)
            
            # Ensure coordinates are within bounds
            x = max(0, min(x, img_width))
            y = max(0, min(y, img_height))
            x2 = min(x + w, img_width)
            y2 = min(y + h, img_height)
            
            if x2 > x and y2 > y:
                # Extract region
                region_img = image.crop((x, y, x2, y2))
                
                # Apply strong Gaussian blur
                blurred_region = region_img.filter(ImageFilter.GaussianBlur(radius=15))
                
                # Paste blurred region back
                image.paste(blurred_region, (x, y))
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return JSONResponse(content={
            "image_base64": img_base64,
            "format": "png",
            "boxes": regions_list,
            "dimensions": {"width": img_width, "height": img_height}
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

@app.post("/extract_entities")
async def extract_entities(text: str):
    """
    Stub entity extraction endpoint
    In production, this would use NER models
    """
    # Simple pattern-based extraction for demo
    entities = {
        "locations": [],
        "organizations": [],
        "persons": [],
        "traditional_practices": []
    }
    
    # Look for capitalized words as potential entities
    words = text.split()
    for i, word in enumerate(words):
        if word and word[0].isupper() and len(word) > 2:
            # Simple heuristic: classify as person if followed by another capital word
            if i < len(words) - 1 and words[i + 1][0].isupper():
                entities["persons"].append(f"{word} {words[i + 1]}")
            elif word.endswith("ite") or word.endswith("ois"):
                entities["locations"].append(word)
    
    return entities

@app.post("/classify_text")
async def classify_text(text: str):
    """
    Classify text into traditional knowledge categories
    """
    text_lower = text.lower()
    
    categories = []
    confidence_scores = {}
    
    # Simple keyword-based classification
    if any(word in text_lower for word in ["manje", "soup", "kasav", "diri", "pwa"]):
        categories.append("C-FOOD")
        confidence_scores["C-FOOD"] = 0.8
    
    if any(word in text_lower for word in ["remed", "fey", "te", "maladi", "gerizon"]):
        categories.append("C-MED")
        confidence_scores["C-MED"] = 0.7
    
    if any(word in text_lower for word in ["plant", "jaden", "rekolt", "sezon"]):
        categories.append("C-AGRI")
        confidence_scores["C-AGRI"] = 0.6
    
    if any(word in text_lower for word in ["trese", "panye", "ti", "kouto"]):
        categories.append("C-CRAFT")
        confidence_scores["C-CRAFT"] = 0.5
    
    if any(word in text_lower for word in ["seremoni", "dans", "tambou", "chante"]):
        categories.append("C-RITUAL")
        confidence_scores["C-RITUAL"] = 0.7
    
    if not categories:
        categories.append("C-OTHER")
        confidence_scores["C-OTHER"] = 0.3
    
    return {
        "categories": categories,
        "confidence_scores": confidence_scores
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)