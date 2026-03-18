import pandas as pd
from db_connect import get_engine

def fetch_counties():
    engine = get_engine()
    
    query = """
        SELECT ogc_fid, adm1_name, adm1_pcode, area_sqkm 
        FROM counties 
        ORDER BY adm1_name
    """
    
    df = pd.read_sql(query, engine)
    return df

if __name__ == "__main__":
    df = fetch_counties()
    print(f"Total counties: {len(df)}")
    print(f"\nFirst 5 counties:")
    print(df.head())