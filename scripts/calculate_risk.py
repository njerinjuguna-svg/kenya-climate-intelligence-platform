import pandas as pd
import numpy as np
from db_connect import get_engine, get_connection
from fetch_counties import fetch_counties

def calculate_risk_scores():
    engine = get_engine()
    
    # Step 1: Fetch all counties
    counties = fetch_counties()
    print(f"Processing {len(counties)} counties...")
    
    # Step 2: Fetch latest NDVI per county
    # We compare baseline vs recent to get vegetation change %
    ndvi_query = """
        SELECT 
            county_id,
            date,
            ndvi_value,
            vegetation_health
        FROM vegetation_index
        ORDER BY county_id, date
    """
    ndvi_df = pd.read_sql(ndvi_query, engine)
    
    # Step 3: Fetch latest rainfall per county
    rainfall_query = """
        SELECT 
            county_id,
            date,
            rainfall_mm
        FROM rainfall_data
        ORDER BY county_id, date
    """
    rainfall_df = pd.read_sql(rainfall_query, engine)
    
    # Step 4: Calculate vegetation change per county
    # Compare earliest NDVI to latest NDVI
    def get_vegetation_change(county_id):
        county_ndvi = ndvi_df[ndvi_df['county_id'] == county_id]
        if len(county_ndvi) < 2:
            return 0
        earliest = county_ndvi.iloc[0]['ndvi_value']
        latest = county_ndvi.iloc[-1]['ndvi_value']
        if earliest == 0:
            return 0
        # Calculate percentage change
        change = ((latest - earliest) / earliest) * 100
        return round(change, 2)
    
    # Step 5: Calculate rainfall trend per county
    def get_rainfall_trend(county_id):
        county_rain = rainfall_df[rainfall_df['county_id'] == county_id]
        if len(county_rain) < 2:
            return 'Stable'
        earliest = county_rain.iloc[0]['rainfall_mm']
        latest = county_rain.iloc[-1]['rainfall_mm']
        if earliest == 0:
            return 'Stable'
        change_pct = ((latest - earliest) / earliest) * 100
        if change_pct <= -20:
            return 'Decreasing'
        elif change_pct <= -5:
            return 'Slightly Decreasing'
        elif change_pct >= 10:
            return 'Increasing'
        else:
            return 'Stable'
    
    # Step 6: Apply to all counties
    counties['vegetation_change'] = counties['ogc_fid'].apply(get_vegetation_change)
    counties['rainfall_trend'] = counties['ogc_fid'].apply(get_rainfall_trend)
    
    # Step 7: Determine drought risk from vegetation + rainfall
    def get_drought_risk(row):
        veg_change = row['vegetation_change']
        rainfall = row['rainfall_trend']
        if veg_change <= -20 or rainfall == 'Decreasing':
            return 'High'
        elif veg_change <= -10 or rainfall == 'Slightly Decreasing':
            return 'Medium'
        else:
            return 'Low'
    
    counties['drought_risk'] = counties.apply(get_drought_risk, axis=1)
    
    # Step 8: Convert to scores
    def risk_to_number(risk):
        return {'High': 9.0, 'Medium': 5.0, 'Low': 2.0}.get(risk, 5.0)
    
    def vegetation_to_score(change):
        if change <= -20: return 9.0
        elif change <= -10: return 7.0
        elif change <= -5: return 5.0
        else: return 3.0
    
    def rainfall_to_score(trend):
        return {
            'Decreasing': 8.0,
            'Slightly Decreasing': 5.0,
            'Stable': 3.0,
            'Increasing': 1.0
        }.get(trend, 5.0)
    
    counties['drought_score'] = counties['drought_risk'].apply(risk_to_number)
    counties['vegetation_score'] = counties['vegetation_change'].apply(vegetation_to_score)
    counties['rainfall_score'] = counties['rainfall_trend'].apply(rainfall_to_score)
    
    # Step 9: Weighted risk score
    counties['calculated_risk_score'] = (
        counties['drought_score']    * 0.35 +
        counties['rainfall_score']   * 0.30 +
        counties['vegetation_score'] * 0.20 +
        2.0                          * 0.15  # base flood score
    ).round(2)
    
    return counties

if __name__ == "__main__":
    df = calculate_risk_scores()
    print("\n--- Climate Risk Scores (Real Data) ---")
    print(df[['adm1_name', 'drought_risk', 'rainfall_trend',
              'vegetation_change', 'calculated_risk_score']].to_string())
    print(f"\nHighest risk: {df.loc[df['calculated_risk_score'].idxmax(), 'adm1_name']}")
    print(f"Lowest risk:  {df.loc[df['calculated_risk_score'].idxmin(), 'adm1_name']}")