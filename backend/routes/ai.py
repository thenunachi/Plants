import json
from flask import Blueprint, jsonify, request, current_app
from groq import Groq
from models import db
from models.plant import Plant, Region

ai_bp = Blueprint('ai', __name__)

SYSTEM_PROMPT = """You are a botanical expert and gardening database assistant.
When given a plant name, first determine if it is a real, recognised plant or flower.

If it is NOT a real plant (e.g. gibberish, a food dish, a person's name, a random word), respond with ONLY this JSON and nothing else:
{"not_found": true, "message": "\"<input>\" is not a recognised plant. Please check the spelling or try a different plant name."}

If it IS a real plant, respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.
The JSON must exactly match this schema:

{
  "name": "string (common name, title-cased)",
  "scientific_name": "string (Latin binomial)",
  "category": "one of: vegetable, fruit, grain, herb, flower, succulent",
  "description": "string (2-3 sentences: what it is, culinary/ornamental use, key trait)",
  "germination_weeks_min": integer,
  "germination_weeks_max": integer,
  "fruit_bearing_weeks_min": integer,
  "fruit_bearing_weeks_max": integer,
  "temp_min": float (°C, minimum survivable),
  "temp_max": float (°C, maximum survivable),
  "temp_optimal": float (°C, best growth),
  "sunlight": "one of: Full Sun, Partial Shade, Shade",
  "water_needs": "one of: Low, Moderate, High",
  "soil_type": "string (brief description)",
  "difficulty": "one of: easy, medium, hard",
  "emoji": "single most relevant emoji",
  "soil_ph_min": float,
  "soil_ph_max": float,
  "is_indoor_capable": boolean,
  "overwintering_temp": float or null (°C threshold to bring indoors; null if frost-hardy),
  "overwintering_tips": "string (2-3 sentences on overwintering or year-round outdoor care)",
  "propagation_method": "string (comma-separated methods, e.g. Seed, Cutting)",
  "pruning_tips": "string (2-3 sentences on pruning and maintenance)",
  "companions": [{"name": "string", "benefit": "string"}, ...],
  "foes": [{"name": "string", "reason": "string"}, ...],
  "pests": [{"name": "string", "description": "string"}, ...],
  "calendar": {
    "sow_indoors_start": integer or null (month 1-12),
    "sow_indoors_end": integer or null,
    "transplant_start": integer or null,
    "transplant_end": integer or null,
    "harvest_start": integer or null,
    "harvest_end": integer or null
  },
  "regions": ["array of applicable climate regions from: Tropical, Subtropical, Temperate, Mediterranean, Arid / Desert, Alpine / Arctic"]
}

Rules:
- companions must have 3-5 entries
- foes must have 2-3 entries
- pests must have 2-4 entries
- regions must include all climates where this plant thrives
- All integers/floats must be numbers not strings
- Do not include any text outside the JSON object
"""


def _safe_int(val, default):
    """Return int(val) if val is not None, else default."""
    return int(val) if val is not None else default


def _safe_float(val, default):
    """Return float(val) if val is not None, else default."""
    return float(val) if val is not None else default


def _plant_to_db(data, regions_map):
    """Convert Groq JSON response dict → Plant ORM object."""
    cal = data.get('calendar', {}) or {}
    companions = data.get('companions', []) or []
    foes = data.get('foes', []) or []
    pests = data.get('pests', []) or []

    region_names = data.get('regions', []) or []
    plant_regions = [regions_map[r] for r in region_names if r in regions_map]

    plant = Plant(
        name=data['name'],
        scientific_name=data.get('scientific_name', ''),
        category=data.get('category', 'herb'),
        description=data.get('description', ''),
        germination_weeks_min=_safe_int(data.get('germination_weeks_min'), 1),
        germination_weeks_max=_safe_int(data.get('germination_weeks_max'), 2),
        fruit_bearing_weeks_min=_safe_int(data.get('fruit_bearing_weeks_min'), 8),
        fruit_bearing_weeks_max=_safe_int(data.get('fruit_bearing_weeks_max'), 12),
        temp_min=_safe_float(data.get('temp_min'), 5.0),
        temp_max=_safe_float(data.get('temp_max'), 35.0),
        temp_optimal=_safe_float(data.get('temp_optimal'), 20.0),
        sunlight=data.get('sunlight', 'Full Sun'),
        water_needs=data.get('water_needs', 'Moderate'),
        soil_type=data.get('soil_type', 'Well-drained loamy soil'),
        difficulty=data.get('difficulty', 'easy'),
        emoji=data.get('emoji', '🌿'),
        soil_ph_min=_safe_float(data.get('soil_ph_min'), 6.0),
        soil_ph_max=_safe_float(data.get('soil_ph_max'), 7.0),
        is_indoor_capable=bool(data.get('is_indoor_capable') or False),
        overwintering_temp=_safe_float(data.get('overwintering_temp'), None) if data.get('overwintering_temp') is not None else None,
        overwintering_tips=data.get('overwintering_tips') or '',
        propagation_method=data.get('propagation_method') or 'Seed',
        pruning_tips=data.get('pruning_tips') or '',
        companions_json=json.dumps(companions),
        foes_json=json.dumps(foes),
        pests_json=json.dumps(pests),
        sow_indoors_start=_safe_int(cal.get('sow_indoors_start'), None),
        sow_indoors_end=_safe_int(cal.get('sow_indoors_end'), None),
        transplant_start=_safe_int(cal.get('transplant_start'), None),
        transplant_end=_safe_int(cal.get('transplant_end'), None),
        harvest_start=_safe_int(cal.get('harvest_start'), None),
        harvest_end=_safe_int(cal.get('harvest_end'), None),
        regions=plant_regions,
    )
    return plant


@ai_bp.route('/ask', methods=['POST'])
def ask_plant():
    body = request.get_json(silent=True) or {}
    plant_name = (body.get('plant_name') or '').strip()

    if not plant_name:
        return jsonify({'error': 'plant_name is required'}), 400

    # Check if already in DB (case-insensitive)
    existing = Plant.query.filter(Plant.name.ilike(plant_name)).first()
    if existing:
        return jsonify({'plant': existing.to_dict(), 'source': 'database'})

    api_key = current_app.config.get('GROQ_API_KEY', '')
    if not api_key:
        return jsonify({'error': 'Groq API key not configured on server.'}), 500

    # Call Groq
    try:
        client = Groq(api_key=api_key)
        chat = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': f'Give me the complete plant profile for: {plant_name}'},
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        raw = chat.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({'error': f'Groq API error: {str(e)}'}), 502

    # Parse JSON
    try:
        # Strip markdown code fences if model wraps anyway
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        plant_data = json.loads(raw)
    except json.JSONDecodeError as e:
        return jsonify({'error': f'Could not parse AI response as JSON: {str(e)}', 'raw': raw}), 502

    # Not a real plant — return message without saving
    if plant_data.get('not_found'):
        return jsonify({'not_found': True, 'message': plant_data.get('message', f'"{plant_name}" is not a recognised plant. Please check the spelling or try a different plant name.')}), 404

    # Build region lookup map
    all_regions = Region.query.all()
    regions_map = {r.name: r for r in all_regions}

    # Save to DB
    try:
        new_plant = _plant_to_db(plant_data, regions_map)
        db.session.add(new_plant)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    return jsonify({'plant': new_plant.to_dict(), 'source': 'ai'}), 201
