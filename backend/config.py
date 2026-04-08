import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    _db_url = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'plants.db')}")
    # Render/Heroku supply postgres:// but SQLAlchemy 2.x needs postgresql://
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '') or os.getenv('API_KEY', '')
