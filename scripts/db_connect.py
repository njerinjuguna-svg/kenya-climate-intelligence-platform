import psycopg2
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

# psycopg2 connection (for non-pandas use)
def get_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=5432
    )
    return conn

# SQLAlchemy engine (for pandas)
def get_engine():
    db_url = (
        f"postgresql://{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:5432/"
        f"{os.getenv('DB_NAME')}"
    )
    return create_engine(db_url)

if __name__ == "__main__":
    try:
        conn = get_connection()
        print("✅ Connected to climate_platform database!")
        conn.close()
        engine = get_engine()
        print("✅ SQLAlchemy engine created!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")