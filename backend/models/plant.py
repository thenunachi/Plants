import json
from models import db

plant_regions = db.Table('plant_regions',
    db.Column('plant_id', db.Integer, db.ForeignKey('plants.id'), primary_key=True),
    db.Column('region_id', db.Integer, db.ForeignKey('regions.id'), primary_key=True)
)

class Region(db.Model):
    __tablename__ = 'regions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    climate = db.Column(db.String(100))
    avg_temp_min = db.Column(db.Float)
    avg_temp_max = db.Column(db.Float)
    last_frost_month = db.Column(db.Integer)   # typical last spring frost (1-12), None = no frost
    first_frost_month = db.Column(db.Integer)  # typical first fall frost (1-12), None = no frost
    plants = db.relationship('Plant', secondary=plant_regions, back_populates='regions')

    def to_dict(self, include_plants=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'climate': self.climate,
            'avg_temp_min': self.avg_temp_min,
            'avg_temp_max': self.avg_temp_max,
            'last_frost_month': self.last_frost_month,
            'first_frost_month': self.first_frost_month,
        }
        if include_plants:
            data['plants'] = [p.to_dict() for p in self.plants]
        return data


class Plant(db.Model):
    __tablename__ = 'plants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    scientific_name = db.Column(db.String(150))
    category = db.Column(db.String(50))  # vegetable, fruit, grain, herb, flower, succulent
    description = db.Column(db.Text)

    # Growth timing
    germination_weeks_min = db.Column(db.Integer)
    germination_weeks_max = db.Column(db.Integer)
    fruit_bearing_weeks_min = db.Column(db.Integer)
    fruit_bearing_weeks_max = db.Column(db.Integer)

    # Temperature
    temp_min = db.Column(db.Float)
    temp_max = db.Column(db.Float)
    temp_optimal = db.Column(db.Float)

    # Basic care
    sunlight = db.Column(db.String(50))
    water_needs = db.Column(db.String(50))
    soil_type = db.Column(db.String(100))
    difficulty = db.Column(db.String(20))
    emoji = db.Column(db.String(10))

    # Soil pH
    soil_ph_min = db.Column(db.Float)
    soil_ph_max = db.Column(db.Float)

    # Indoor/overwintering
    is_indoor_capable = db.Column(db.Boolean, default=False)
    overwintering_temp = db.Column(db.Float)   # bring indoors below this °C; None = frost-hardy
    overwintering_tips = db.Column(db.Text)

    # Propagation & pruning
    propagation_method = db.Column(db.String(100))  # e.g. "Seed, Cutting"
    pruning_tips = db.Column(db.Text)

    # Companion planting (stored as JSON strings)
    companions_json = db.Column(db.Text)  # [{name, benefit}]
    foes_json = db.Column(db.Text)        # [{name, reason}]
    pests_json = db.Column(db.Text)       # [{name, description}]

    # Planting calendar (month numbers 1-12; None = not applicable)
    sow_indoors_start = db.Column(db.Integer)
    sow_indoors_end = db.Column(db.Integer)
    transplant_start = db.Column(db.Integer)
    transplant_end = db.Column(db.Integer)
    harvest_start = db.Column(db.Integer)
    harvest_end = db.Column(db.Integer)

    regions = db.relationship('Region', secondary=plant_regions, back_populates='plants')

    def to_dict(self, include_regions=False):
        data = {
            'id': self.id,
            'name': self.name,
            'scientific_name': self.scientific_name,
            'category': self.category,
            'description': self.description,
            'germination_weeks_min': self.germination_weeks_min,
            'germination_weeks_max': self.germination_weeks_max,
            'fruit_bearing_weeks_min': self.fruit_bearing_weeks_min,
            'fruit_bearing_weeks_max': self.fruit_bearing_weeks_max,
            'temp_min': self.temp_min,
            'temp_max': self.temp_max,
            'temp_optimal': self.temp_optimal,
            'sunlight': self.sunlight,
            'water_needs': self.water_needs,
            'soil_type': self.soil_type,
            'difficulty': self.difficulty,
            'emoji': self.emoji,
            'soil_ph_min': self.soil_ph_min,
            'soil_ph_max': self.soil_ph_max,
            'is_indoor_capable': self.is_indoor_capable,
            'overwintering_temp': self.overwintering_temp,
            'overwintering_tips': self.overwintering_tips,
            'propagation_method': self.propagation_method,
            'pruning_tips': self.pruning_tips,
            'companions': json.loads(self.companions_json) if self.companions_json else [],
            'foes': json.loads(self.foes_json) if self.foes_json else [],
            'pests': json.loads(self.pests_json) if self.pests_json else [],
            'calendar': {
                'sow_indoors_start': self.sow_indoors_start,
                'sow_indoors_end': self.sow_indoors_end,
                'transplant_start': self.transplant_start,
                'transplant_end': self.transplant_end,
                'harvest_start': self.harvest_start,
                'harvest_end': self.harvest_end,
            },
            'regions': [r.to_dict() for r in self.regions],
        }
        return data
