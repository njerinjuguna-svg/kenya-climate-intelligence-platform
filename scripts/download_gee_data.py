import gdown
import os

# ---- DOWNLOAD NDVI CSV ----
# After GEE export completes, get the shareable link
# from Google Drive and paste it here
# Go to Drive → right click file → Share → Copy link

def download_gee_exports():
    print("Downloading GEE exports from Google Drive...")
    
    # You will replace these URLs after your GEE exports complete
    # For now this shows the pattern
    
    # Example:
    # ndvi_url = "https://drive.google.com/uc?id=YOUR_FILE_ID"
    # gdown.download(ndvi_url, 'data/ndvi_data.csv', quiet=False)
    
    print("Instructions:")
    print("1. Go to Google Drive")
    print("2. Find Kenya_NDVI_47Counties.csv")
    print("3. Right click → Share → Copy link")
    print("4. Paste the link in this script")
    print("5. Run again")

if __name__ == "__main__":
    download_gee_exports()