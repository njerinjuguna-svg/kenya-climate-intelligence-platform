import pandas as pd
from db_connect import get_engine

engine = get_engine()

# Check all tables
ndvi = pd.read_sql('SELECT count(*) FROM vegetation_index', engine)
rain = pd.read_sql('SELECT count(*) FROM rainfall_data', engine)
risk = pd.read_sql('SELECT count(*) FROM climate_risk', engine)

print(f"NDVI rows:     {ndvi.iloc[0,0]}")
print(f"Rainfall rows: {rain.iloc[0,0]}")
print(f"Risk rows:     {risk.iloc[0,0]}")

# Show NDVI sample
print("\n--- NDVI Sample ---")
sample = pd.read_sql("""
    SELECT c.adm1_name, v.date, v.ndvi_value, v.vegetation_health
    FROM vegetation_index v
    JOIN counties c ON v.county_id = c.ogc_fid
    ORDER BY c.adm1_name, v.date
    LIMIT 10
""", engine)
print(sample.to_string())

# Show rainfall sample
print("\n--- Rainfall Sample ---")
rain_sample = pd.read_sql("""
    SELECT c.adm1_name, r.date, r.rainfall_mm
    FROM rainfall_data r
    JOIN counties c ON r.county_id = c.ogc_fid
    ORDER BY c.adm1_name, r.date
    LIMIT 10
""", engine)
print(rain_sample.to_string())

# Show risk scores
print("\n--- Risk Scores ---")
risk_sample = pd.read_sql("""
    SELECT c.adm1_name, cr.drought_risk, cr.risk_score, 
           cr.rainfall_trend, cr.vegetation_change
    FROM climate_risk cr
    JOIN counties c ON cr.county_id = c.ogc_fid
    ORDER BY cr.risk_score DESC
    LIMIT 10
""", engine)
print(risk_sample.to_string())