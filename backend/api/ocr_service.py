import re
import os
import cv2
import numpy as np
import pytesseract
from PIL import Image

try:
    import pypdf
except ImportError:
    pypdf = None

IGNORE_WORDS = {
    'number', 'no', 'code', 'name', 'details', 'type', 'period', 'date',
    'price', 'information', 'qty', 'item', 'brand', 'model', 'serial', 'customer',
    'the', 'is', 'of', 'and', 'for', 'from', 'to', 'in', 'on', 'at', 'by',
    'warranty', 'certificate', 'invoice', 'purchase', 'bill', 'total', 'amount',
}

# Known appliance brands for matching
KNOWN_BRANDS = [
    'LG', 'Samsung', 'Sony', 'Whirlpool', 'Bosch', 'Panasonic', 'Philips',
    'Dyson', 'Haier', 'GE Appliances', 'IFB', 'Voltas', 'Godrej', 'Daikin',
    'Hitachi', 'Toshiba', 'Sharp', 'Electrolux', 'Siemens', 'Carrier',
    'Blue Star', 'Crompton', 'Bajaj', 'Havells', 'Kenmore', 'Maytag',
    'KitchenAid', 'Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI',
    'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Nokia',
]

# Appliance category keywords
CATEGORY_MAP = [
    ('Refrigerator', ['refrigerator', 'fridge', 'cooler', 'double door', 'single door', 'freezer']),
    ('Air Conditioner', ['air conditioner', r'\bac\b', 'dualcool', 'split ac', 'conditioner', 'inverter ac', 'window ac']),
    ('Washing Machine', ['washing machine', 'washer', 'frontload', 'topload', 'laundry', 'dryer']),
    ('Television', ['television', 'tv', 'oled', 'bravia', 'smart tv', 'led tv', 'qled']),
    ('Microwave', ['microwave', 'oven', 'convection', 'otg']),
    ('Water Heater', ['water heater', 'geyser', 'water purifier']),
    ('Laptop', ['laptop', 'macbook', 'notebook', 'chromebook']),
    ('Mobile Phone', ['mobile', 'smartphone', 'phone', 'iphone', 'galaxy']),
    ('Insurance', ['insurance', 'accident', 'sickness', 'health', 'life insurance']),
]


def preprocess_image_for_ocr(file_path):
    """
    Advanced image preprocessing using OpenCV for better OCR accuracy.
    Applies multiple preprocessing techniques and picks the best result.
    """
    image = cv2.imread(file_path)
    if image is None:
        return None

    results = []

    # Method 1: Adaptive threshold on grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Method 2: Resize if image is small
    h, w = gray.shape
    if w < 1000:
        scale = 1500 / w
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # Method 3: Denoise
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

    # Method 4: Adaptive threshold
    adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    try:
        text1 = pytesseract.image_to_string(adaptive, config='--psm 6')
        results.append(text1)
    except Exception:
        pass

    # Method 5: Otsu threshold
    _, otsu = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    try:
        text2 = pytesseract.image_to_string(otsu, config='--psm 6')
        results.append(text2)
    except Exception:
        pass

    # Method 6: Simple grayscale (often works well for clean documents)
    try:
        text3 = pytesseract.image_to_string(gray, config='--psm 6')
        results.append(text3)
    except Exception:
        pass

    # Pick the result with the most content
    if results:
        return max(results, key=lambda t: len(t.strip()))
    return None


def process_document_ocr(file_path):
    """
    Process document/bill image or PDF file using OpenCV, PyTesseract, and PyPDF.
    Returns structured data with brand, model, serial, purchase date, price, warranty duration.
    Works for both purchase invoices AND warranty certificates.
    """
    raw_text = ""
    ext = os.path.splitext(file_path)[1].lower()

    # 1. Handle PDF Documents
    if ext == '.pdf':
        try:
            if pypdf:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        raw_text += txt + "\n"
        except Exception:
            raw_text = ""

    # 2. Handle Image Documents using advanced preprocessing
    if not raw_text.strip():
        try:
            preprocessed_text = preprocess_image_for_ocr(file_path)
            if preprocessed_text and len(preprocessed_text.strip()) >= 5:
                raw_text = preprocessed_text
            else:
                # Fallback: direct PIL
                try:
                    pil_img = Image.open(file_path)
                    raw_text = pytesseract.image_to_string(pil_img)
                except Exception:
                    raw_text = ""
        except Exception:
            try:
                pil_img = Image.open(file_path)
                raw_text = pytesseract.image_to_string(pil_img)
            except Exception:
                raw_text = ""

    # 3. If OCR produced no text at all, return empty result with raw_text note
    if not raw_text or len(raw_text.strip()) < 5:
        return {
            'brand': '',
            'product_name': '',
            'model_number': '',
            'serial_number': '',
            'invoice_number': '',
            'purchase_date': '',
            'price': '',
            'warranty_duration': '',
            'customer_name': '',
            'id_number': '',
            'service_description': '',
            'warranty_start_date': '',
            'warranty_end_date': '',
            'raw_text': 'Could not extract text from the document. Please ensure the image is clear and well-lit.',
            'confidence': 0
        }

    # 4. Detect document type
    text_lower = raw_text.lower()
    is_warranty_cert = any(kw in text_lower for kw in [
        'warranty certificate', 'warranty card', 'guarantee certificate',
        'guarantee card', 'warranty period', 'quality assurance',
        'insurer', 'coverage period'
    ])
    is_invoice = any(kw in text_lower for kw in [
        'invoice', 'bill', 'receipt', 'purchase order', 'tax invoice',
        'proforma', 'challan', 'quotation'
    ])

    # 5. Extract all fields
    extracted = {
        'brand': extract_brand(raw_text),
        'product_name': extract_product_name(raw_text),
        'model_number': extract_model_number(raw_text),
        'serial_number': extract_serial_number(raw_text),
        'invoice_number': extract_invoice_number(raw_text),
        'purchase_date': extract_date(raw_text),
        'price': extract_price(raw_text),
        'warranty_duration': extract_warranty(raw_text),
        'customer_name': extract_customer_name(raw_text),
        'id_number': extract_id_number(raw_text),
        'service_description': extract_service_description(raw_text),
        'warranty_start_date': '',
        'warranty_end_date': '',
        'raw_text': raw_text.strip(),
        'document_type': 'Warranty Certificate' if is_warranty_cert else ('Purchase Invoice' if is_invoice else 'Document'),
        'confidence': calculate_confidence(raw_text)
    }

    # 6. For warranty certificates, extract start/end dates and compute duration
    if is_warranty_cert:
        start, end = extract_warranty_period_dates(raw_text)
        if start:
            extracted['warranty_start_date'] = start
            extracted['purchase_date'] = extracted['purchase_date'] or start
        if end:
            extracted['warranty_end_date'] = end
        if start and end:
            duration = compute_warranty_duration(start, end)
            if duration:
                extracted['warranty_duration'] = duration

    return extracted


def calculate_confidence(text):
    """Calculate a rough confidence score based on how much useful data was extracted."""
    score = 0
    text_lower = text.lower()
    if len(text.strip()) > 20:
        score += 20
    if len(text.strip()) > 100:
        score += 10
    if re.search(r'\d{2}[\/\.\-]\d{2}[\/\.\-]\d{4}', text):
        score += 15
    if any(b.lower() in text_lower for b in KNOWN_BRANDS):
        score += 15
    if re.search(r'model|serial|brand', text_lower):
        score += 10
    if re.search(r'warranty|guarantee', text_lower):
        score += 10
    if re.search(r'price|total|amount|cost|\$|₹|rs', text_lower):
        score += 10
    if re.search(r'invoice|bill|receipt|certificate', text_lower):
        score += 10
    return min(score, 100)


def extract_key_value(text, keys):
    """
    Generic key-value extractor. Given a list of possible key names,
    searches for lines like 'Key: Value' or 'Key  Value' and returns the value.
    """
    for key in keys:
        # Pattern: Key : Value or Key: Value (with optional separators)
        pattern = rf'{re.escape(key)}\s*[:;\-=]\s*(.+)'
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            val = match.group(1).strip()
            # Clean up trailing noise
            val = re.sub(r'\s{2,}.*$', '', val)
            if val and len(val) >= 2 and val.lower() not in IGNORE_WORDS:
                return val
    return ''


def extract_brand(text):
    """Extract brand from text, checking known brands list."""
    # First check key-value patterns
    kv = extract_key_value(text, ['Brand', 'Manufacturer', 'Make', 'Company'])
    if kv:
        for b in KNOWN_BRANDS:
            if b.lower() in kv.lower():
                return b
        return kv

    # Then scan full text for known brands
    for b in KNOWN_BRANDS:
        if re.search(r'\b' + re.escape(b) + r'\b', text, re.IGNORECASE):
            return b
    return ""


def extract_product_name(text):
    """Extract appliance category from text."""
    # Check key-value first
    kv = extract_key_value(text, ['Item', 'Product', 'Appliance', 'Category', 'Service', 'Type'])
    if kv:
        kv_lower = kv.lower()
        for cat, keywords in CATEGORY_MAP:
            for keyword in keywords:
                if re.search(keyword, kv_lower, re.IGNORECASE):
                    return cat

    # Scan full text using regex
    for cat, keywords in CATEGORY_MAP:
        for kw in keywords:
            if re.search(kw, text, re.IGNORECASE):
                return cat
    return ""


def extract_model_number(text):
    """Extract model number from document text."""
    # 1. Explicit key-value
    kv = extract_key_value(text, ['Model No', 'Model Number', 'Model #', 'Model'])
    if kv and len(kv) >= 3 and kv.lower() not in IGNORE_WORDS:
        # Take only the first token if it looks like a model number
        tokens = kv.split()
        result = tokens[0] if tokens else kv
        if len(result) >= 3:
            return result

    # 2. Hyphenated model codes e.g. GL-B257, WW90T-FrontLoad
    hyphenated = re.findall(r'\b([A-Za-z]{1,6}\-[A-Za-z0-9]{2,15})\b', text)
    for h in hyphenated:
        if not re.search(r'(?:BHE|INV|GSTIN|SER|GST|CARD|TEST|PER|http)', h, re.IGNORECASE):
            return h.strip()

    # 3. Alphanumeric codes with mixed letters and digits (at least 4 chars)
    codes = re.findall(r'\b([A-Z]{1,4}[0-9]{2,}[A-Z0-9]*)\b', text)
    for c in codes:
        if len(c) >= 4 and c not in IGNORE_WORDS:
            return c

    return ""


def extract_serial_number(text):
    """Extract serial number from document text."""
    # 1. Explicit key-value
    kv = extract_key_value(text, ['Serial No', 'Serial Number', 'S/N', 'Serial #', 'Serial'])
    if kv and len(kv) >= 6 and kv.lower() not in IGNORE_WORDS:
        tokens = kv.split()
        return tokens[0] if tokens else kv

    # 2. Long alphanumeric codes (8-22 chars, mixed alpha and digits)
    candidates = re.findall(r'\b([A-Z0-9\-]{8,22})\b', text)
    model = extract_model_number(text)
    for c in candidates:
        c_clean = c.replace('-', '')
        if (c.lower() not in IGNORE_WORDS and
            c != model and
            any(ch.isalpha() for ch in c_clean) and
            any(ch.isdigit() for ch in c_clean) and
            not c.startswith('GSTIN') and
            not re.match(r'^\d{2}[\-/\.]\d{2}[\-/\.]\d{4}$', c)):
            return c.strip()

    return ""


def extract_invoice_number(text):
    """Extract invoice number from document text."""
    kv = extract_key_value(text, ['Invoice No', 'Invoice Number', 'Invoice #', 'Invoice',
                                   'Bill No', 'Bill Number', 'Receipt No', 'Receipt Number'])
    if kv:
        tokens = kv.split()
        return tokens[0] if tokens else kv
    return ""


def extract_customer_name(text):
    """Extract customer name from document text."""
    kv = extract_key_value(text, ['Customer name', 'Customer Name', 'Customer', 'Name',
                                   'Buyer', 'Client', 'Account Holder'])
    if kv and kv.lower() not in IGNORE_WORDS and len(kv) >= 3:
        # Filter out if value is just a label
        if kv.lower() not in {'name', 'customer', 'buyer', 'client'}:
            return kv
    return ""


def extract_id_number(text):
    """Extract ID/policy number from document text."""
    kv = extract_key_value(text, ['ID number', 'ID No', 'ID Number', 'Policy No', 'Policy Number',
                                   'Certificate No', 'Certificate Number', 'Reference No'])
    if kv:
        tokens = kv.split()
        return tokens[0] if tokens else kv

    # Look for long numeric IDs (10+ digits)
    long_nums = re.findall(r'\b(\d{10,})\b', text)
    if long_nums:
        return long_nums[0]
    return ""


def extract_service_description(text):
    """Extract service/coverage description from document text."""
    kv = extract_key_value(text, ['Service', 'Coverage', 'Plan', 'Description', 'Coverage Type'])
    if kv and kv.lower() not in IGNORE_WORDS and len(kv) >= 3:
        return kv
    return ""


def extract_date(text):
    """
    Extract the most relevant date from text.
    Supports formats: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD, YYYY/MM/DD
    """
    # 1. Look for labeled dates first
    date_labels = ['Date of purchase', 'Purchase Date', 'Invoice Date', 'Date', 'Billing Date', 'Order Date']
    for label in date_labels:
        pattern = rf'{re.escape(label)}\s*[:;\-=]?\s*(\d{{1,2}}[\/\.\-]\d{{1,2}}[\/\.\-]\d{{2,4}})'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return normalize_date(match.group(1).strip())

    # 2. Find any date in common formats
    dates = re.findall(r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', text)
    if dates:
        return normalize_date(dates[0])

    # 3. ISO format dates
    iso_dates = re.findall(r'(\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})', text)
    if iso_dates:
        return normalize_date(iso_dates[0])

    return ""


def normalize_date(date_str):
    """Normalize date string to DD/MM/YYYY format."""
    # Replace dots and dashes with slashes
    normalized = date_str.replace('.', '/').replace('-', '/')
    parts = normalized.split('/')

    if len(parts) == 3:
        # If first part is 4 digits, it's YYYY/MM/DD
        if len(parts[0]) == 4:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
        # If last part is 2 digits, expand to 4
        if len(parts[2]) == 2:
            year = int(parts[2])
            parts[2] = str(2000 + year if year < 50 else 1900 + year)
        return '/'.join(parts)

    return date_str


def extract_warranty_period_dates(text):
    """
    Extract warranty period start and end dates from text.
    Handles formats like: 'from 12.02.2024 to 12.02.2027' or 'Warranty Period: 12.02.2024 - 12.02.2027'
    """
    # Pattern: from DATE to DATE
    pattern = r'(?:from|valid from|period\s*:?\s*(?:from)?)\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})\s*(?:to|till|until|[-–—])\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return normalize_date(match.group(1)), normalize_date(match.group(2))

    # Pattern: DATE to DATE (without from)
    pattern2 = r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})\s*(?:to|till|until|[-–—])\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})'
    match2 = re.search(pattern2, text, re.IGNORECASE)
    if match2:
        return normalize_date(match2.group(1)), normalize_date(match2.group(2))

    return '', ''


def compute_warranty_duration(start_str, end_str):
    """Compute warranty duration string from start and end dates."""
    try:
        from datetime import datetime
        # Parse dates
        for fmt in ['%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d']:
            try:
                start = datetime.strptime(start_str, fmt)
                end = datetime.strptime(end_str, fmt)
                diff = end - start
                years = diff.days // 365
                months = (diff.days % 365) // 30
                if years > 0 and months > 0:
                    return f"{years} Year{'s' if years > 1 else ''} {months} Month{'s' if months > 1 else ''}"
                elif years > 0:
                    return f"{years} Year{'s' if years > 1 else ''}"
                elif months > 0:
                    return f"{months} Month{'s' if months > 1 else ''}"
                else:
                    return f"{diff.days} Days"
            except ValueError:
                continue
    except Exception:
        pass
    return ""


def extract_price(text):
    """Extract price/amount from document text."""
    # Remove dates first so date numbers don't get misidentified as price
    cleaned = re.sub(r'\b\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b', ' ', text)
    # Remove long digit sequences that look like IDs (10+ digits)
    cleaned = re.sub(r'\b\d{10,}\b', ' ', cleaned)

    # 1. Match labeled prices: Price: 45,000.00, Total: 45000, MRP: ₹45,000.00
    labeled = re.findall(
        r'(?:Price|Total|Amount|MRP|Grand\s*Total|Net\s*Amount|Cost|Val)\s*[:\-\=]?\s*(?:[₹RsINR\$\€\£\s]*)'
        r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{3,7}(?:\.\d{2})?)',
        cleaned, re.IGNORECASE
    )
    if labeled:
        for val in labeled:
            num = float(val.replace(',', ''))
            if num >= 50:
                return val

    # 2. Match currency prefixed: ₹45,000.00, Rs. 45000, $1299.00
    currency_match = re.findall(
        r'(?:₹|Rs\.?|INR|\$|€|£)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{3,7}(?:\.\d{2})?)',
        cleaned, re.IGNORECASE
    )
    if currency_match:
        for val in currency_match:
            num = float(val.replace(',', ''))
            if num >= 50:
                return val

    # 3. Match comma-formatted numbers: 45,000.00
    comma_nums = re.findall(r'(\d{1,3}(?:,\d{3})+(?:\.\d{2})?)', cleaned)
    if comma_nums:
        for val in comma_nums:
            num = float(val.replace(',', ''))
            if num >= 50:
                return val

    # 4. Match decimal amounts >= 50
    decimals = re.findall(r'(\d{3,7}\.\d{2})', cleaned)
    if decimals:
        for val in decimals:
            num = float(val)
            if num >= 50:
                return val

    return ""


def extract_warranty(text):
    """Extract warranty duration string from text."""
    # 1. Look for explicit duration: '2 Years', '12 Months', '3-Year'
    match = re.search(r'(\d+)\s*[-]?\s*(Year|Years|Yr|Yrs|Month|Months|Mo)', text, re.IGNORECASE)
    if match:
        num = match.group(1)
        unit = match.group(2).strip()
        # Normalize unit
        if unit.lower().startswith('y'):
            return f"{num} Year{'s' if int(num) > 1 else ''}"
        else:
            return f"{num} Month{'s' if int(num) > 1 else ''}"

    # 2. Try to compute from date range
    start, end = extract_warranty_period_dates(text)
    if start and end:
        duration = compute_warranty_duration(start, end)
        if duration:
            return duration

    return ""
