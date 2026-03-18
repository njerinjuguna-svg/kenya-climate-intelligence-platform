import pandas as pd
from datetime import date
from db_connect import get_connection
from calculate_risk import calculate_risk_scores

def update_risk_scores():
    # Get calculated scores
    df = calculate_risk_scores()
    
    # Get database connection
    conn = get_connection()
    cursor = conn.cursor()
    
    print("Updating risk scores in database...")
    
    updated = 0
    for _, row in df.iterrows():
        cursor.execute("""
            UPDATE climate_risk 
            SET risk_score = %s,
                assessment_date = %s
            WHERE county_id = %s
        """, (
            float(row['calculated_risk_score']),
            date.today(),
            int(row['ogc_fid'])
        ))
        updated += 1
    
    # Commit all changes
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ Updated risk scores for {updated} counties!")

if __name__ == "__main__":
    update_risk_scores()