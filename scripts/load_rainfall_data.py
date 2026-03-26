import pandas as pd
from db_connect import get_engine, get_connection
from datetime import date

def load_rainfall_data(csv_path):
    print(f"Loading rainfall data from {csv_path}...")
    
    df = pd.read_csv(csv_path)
    print(f"Rows loaded: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(df.head())
    
    engine = get_engine()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get county IDs from database
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
        
        record_date = date(int(row['year']), 12, 31)
        rainfall = float(row['mean']) if not pd.isna(row['mean']) else 0
        
        cursor.execute("""
            INSERT INTO rainfall_data
                (county_id, date, rainfall_mm, data_source)
            VALUES (%s, %s, %s, %s)
        """, (
            int(row['ogc_fid']),
            record_date,
            round(rainfall, 2),
            'CHIRPS/GEE'
        ))
        inserted += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ Inserted: {inserted} rows")
    print(f"⚠️  Skipped: {skipped} rows")

if __name__ == "__main__":
    load_rainfall_data('../data/Kenya_Rainfall_47Counties.csv')