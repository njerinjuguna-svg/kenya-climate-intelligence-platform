import pandas as pd
from db_connect import get_engine, get_connection
from datetime import date

def load_landcover_data(csv_path):
    print(f"Loading land cover data from {csv_path}...")
    
    df = pd.read_csv(csv_path)
    print(f"Rows loaded: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(df.head())
    
    engine = get_engine()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get county IDs
    counties_df = pd.read_sql(
        "SELECT ogc_fid, adm1_name FROM counties",
        engine
    )
    
    # Merge to get county_id
    df = df.merge(
        counties_df,
        on='adm1_name',
        how='left'
    )
    
    inserted = 0
    skipped = 0
    
    for _, row in df.iterrows():
        if pd.isna(row.get('ogc_fid')):
            print(f"  ⚠️  County not found: {row['adm1_name']}")
            skipped += 1
            continue
        
        cursor.execute("""
            INSERT INTO land_cover
                (county_id, year, forest_percent, cropland_percent,
                 urban_percent, bare_land_percent, water_percent)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            int(row['ogc_fid']),
            int(row['year']),
            round(float(row['forest']) if not pd.isna(row['forest']) else 0, 2),
            round(float(row['cropland']) if not pd.isna(row['cropland']) else 0, 2),
            round(float(row['urban']) if not pd.isna(row['urban']) else 0, 2),
            round(float(row['bare']) if not pd.isna(row['bare']) else 0, 2),
            round(float(row['water']) if not pd.isna(row['water']) else 0, 2),
        ))
        inserted += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ Inserted: {inserted} rows")
    print(f"⚠️  Skipped: {skipped} rows")

if __name__ == "__main__":
    load_landcover_data('../data/Kenya_LandCover_47Counties.csv')