import pandas as pd
from db_connect import get_engine, get_connection
from datetime import date

def load_ndvi_data(csv_path):
    print(f"Loading NDVI data from {csv_path}...")
    
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
    
    # Merge to get county_id for each row
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
        
        # Map period to date
        period_dates = {
            'baseline_2000_2005': date(2005, 12, 31),
            'mid_2010_2015':      date(2015, 12, 31),
            'recent_2020_2024':   date(2024, 12, 31),
        }
        record_date = period_dates.get(row['period'], date.today())
        
        # Determine vegetation health from NDVI value
        ndvi = float(row['mean']) if not pd.isna(row['mean']) else 0
        if ndvi >= 0.5:
            health = 'Healthy'
        elif ndvi >= 0.3:
            health = 'Moderate'
        elif ndvi >= 0.1:
            health = 'Poor'
        else:
            health = 'Very Poor'
        
        cursor.execute("""
            INSERT INTO vegetation_index
                (county_id, date, ndvi_value, vegetation_health)
            VALUES (%s, %s, %s, %s)
        """, (
            int(row['ogc_fid']),
            record_date,
            round(ndvi, 4),
            health
        ))
        inserted += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ Inserted: {inserted} rows")
    print(f"⚠️  Skipped: {skipped} rows")

if __name__ == "__main__":
    load_ndvi_data('../data/Kenya_NDVI_47Counties.csv')