import pandas as pd
import numpy as np
from db_connect import get_engine, get_connection
from fetch_counties import fetch_counties

def calculate_risk_scores():
    engine = get_engine()
    
    # Step 1: Fetch all counties
    counties = fetch_counties()
    print(f"Processing {len(counties)} counties...")
    
    # Step 2: Fetch existing climate risk data
    risk_query = """
        SELECT county_id, drought_risk, flood_risk, 
               vegetation_change, rainfall_trend
        FROM climate_risk
    """
    risk_df = pd.read_sql(risk_query, engine)
    
    # Step 3: Merge counties with risk data
    df = counties.merge(risk_df, left_on='ogc_fid', right_on='county_id', how='left')
    
    # Step 4: Convert text risk levels to numbers
    def risk_to_number(risk_level):
        mapping = {
            'High': 9.0,
            'Medium': 5.0,
            'Low': 2.0,
            None: 5.0  # default if no data
        }
        return mapping.get(risk_level, 5.0)
    
    # Step 5: Calculate individual scores
    df['drought_score'] = df['drought_risk'].apply(risk_to_number)
    df['flood_score'] = df['flood_risk'].apply(risk_to_number)
    
    # Step 6: Convert vegetation change to a score
    def vegetation_to_score(change):
        if change is None or np.isnan(change):
            return 5.0
        if change <= -15:
            return 9.0   # severe loss
        elif change <= -10:
            return 7.0   # significant loss
        elif change <= -5:
            return 5.0   # moderate loss
        else:
            return 3.0   # mild loss
    
    df['vegetation_score'] = df['vegetation_change'].apply(vegetation_to_score)
    
    # Step 7: Convert rainfall trend to score
    def rainfall_to_score(trend):
        mapping = {
            'Decreasing': 8.0,
            'Slightly Decreasing': 5.0,
            'Stable': 3.0,
            'Increasing': 1.0,
            None: 5.0
        }
        return mapping.get(trend, 5.0)
    
    df['rainfall_score'] = df['rainfall_trend'].apply(rainfall_to_score)
    
    # Step 8: Calculate weighted overall risk score
    # Drought is most important for Kenya so it gets highest weight
    df['calculated_risk_score'] = (
        df['drought_score'] * 0.35 +      # 35% weight
        df['rainfall_score'] * 0.30 +     # 30% weight
        df['vegetation_score'] * 0.20 +   # 20% weight
        df['flood_score'] * 0.15          # 15% weight
    ).round(2)
    
    return df

if __name__ == "__main__":
    df = calculate_risk_scores()
    
    # Show results
    print("\n--- Climate Risk Scores ---")
    print(df[['adm1_name', 'drought_risk', 'rainfall_trend', 
              'calculated_risk_score']].to_string())
    
    print(f"\nHighest risk county: {df.loc[df['calculated_risk_score'].idxmax(), 'adm1_name']}")
    print(f"Lowest risk county:  {df.loc[df['calculated_risk_score'].idxmin(), 'adm1_name']}")