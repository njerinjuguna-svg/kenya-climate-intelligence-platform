# Kenya Climate & Environmental Intelligence Platform

> *Built by a geospatial engineer who believes that the most urgent problems on the African continent are not problems of ambition — they are problems of data, visibility, and decision support.*

---

## The Problem

Kenya loses an estimated **5.8 million hectares** of forest every decade. Drought displaces hundreds of thousands of pastoralists in the north annually. Flooding along the Tana River basin destroys livelihoods with predictable regularity yet communities and county governments are often caught off guard, not because the data does not exist, but because no one has made it accessible, visual, and actionable.

Organizations like the **National Drought Management Authority (NDMA)**, **Kenya Meteorological Department**, and **county environment offices** are making decisions about resource deployment, early warning systems, and climate adaptation using data that is fragmented across spreadsheets, PDF reports, and siloed government systems. Field analysts spend hours cleaning and reformatting data that should already be ready to use.

This platform exists to change that.

---

## What This Is

The **Kenya Climate & Environmental Intelligence Platform** is a full stack geospatial web application that aggregates, processes, and visualizes real satellite climate data across all **47 counties of Kenya**. It combines **20 years of satellite observations** from NASA and ESA with a spatial database, a REST API, and an interactive map dashboard giving environmental analysts and planners a single interface to monitor drought risk, vegetation health, rainfall trends, and land degradation in real time.

This is not a prototype. The data is real. The analysis is real. The risk scores are calculated from actual satellite observations.

---

## Why This Matters

Kenya is one of the most climate vulnerable countries in the world. The effects are not abstract:

**Turkana, Marsabit, Mandera, and Wajir** counties are classified as chronically food insecure, with drought cycles becoming shorter and more severe.

**Kajiado and Narok** are experiencing accelerating vegetation loss as pastoralist land transitions to agriculture and urban sprawl.

**Western Kenya** faces intensifying seasonal flooding driven by shifting rainfall patterns.

**Central highlands**, Kenya's agricultural heartland, are seeing measurable NDVI decline over two decades.

The gap between satellite data and ground level decisions is where people suffer. This platform bridges that gap.

---

## Live Demo

🌐 **[kenya-climate-platform.vercel.app](https://kenya-climate-platform.vercel.app)**

> To request demo access, contact me via GitHub.

---

## Features

**Interactive Climate Map**
All 47 Kenya counties rendered from real spatial data. Counties are color coded by calculated climate risk score from 0 to 10. Hover tooltips show county name and risk level. Click any county to load its full climate profile. A search bar with live suggestions lets you type a county name and the map flies to it.

**Real Satellite Data Integration**
NDVI vegetation health from NASA MODIS covering 2005 to 2024. Annual rainfall from the CHIRPS dataset covering 2000 to 2023. Data extracted and processed using Google Earth Engine. 20 year trend analysis showing environmental change over time.

**Climate Risk Scoring**
A weighted algorithm combining drought risk at 35%, rainfall trend at 30%, vegetation change at 20%, and flood exposure at 15%. Scores are calculated by Python scripts from real data and classified as Very High, High, Medium, or Low.

**County Climate Panel**
Each county displays drought risk, flood risk, rainfall trend, and vegetation change. An NDVI line chart shows vegetation health across three time periods. A rainfall bar chart uses color coding to classify wet and dry years. Interpretation guides explain what the values mean.

**PDF Report Generation**
One click downloadable Environmental Assessment Report per county. Includes risk indicators, NDVI trend table, rainfall data, and tailored recommendations. Professional formatting suitable for organizational reporting and submissions.

**Authentication System**
JWT based login for analysts. Role based access for admin and analyst accounts. Secure password hashing with bcrypt.

**Data Pipeline**
Python scripts for loading and processing GEE exports. Automated climate risk recalculation from real data. PostGIS spatial database for storing and querying geographic data.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React, Leaflet, Chart.js | Industry standard for geospatial web applications |
| Backend | Node.js, Express | Fast REST API with straightforward PostgreSQL integration |
| Database | PostgreSQL with PostGIS | The gold standard for spatial data storage and querying |
| Satellite Data | Google Earth Engine | Access to 80 petabytes of planetary scale geospatial datasets |
| Data Processing | Python, pandas, SQLAlchemy | Scientific computing ecosystem for spatial analysis |
| Authentication | JWT, bcryptjs | Stateless, secure auth suitable for API first architecture |
| Hosting | Vercel, Render, Supabase | Zero cost production deployment with PostGIS support |

---

## Data Sources

| Dataset | Source | Coverage |
|---|---|---|
| NDVI Vegetation Index | NASA MODIS MOD13A2 | 2000 to 2024, 1km resolution, 16 day composites |
| Rainfall | CHIRPS Daily | 1981 to present, 5km resolution |
| County Boundaries | Kenya IEBC via HUMDATA | All 47 counties, official boundaries |
| Land Cover | Copernicus Global Land Cover | 2015 to 2019, 100m resolution |

All datasets are publicly available and used by organizations including the **UN Environment Programme**, **World Resources Institute**, and **Kenya NDMA**.

---

## System Architecture

```
Google Earth Engine
  (MODIS NDVI + CHIRPS Rainfall)
          |
    Export to CSV
          |
   Python Pipeline
  (clean, transform, load)
          |
 PostGIS Spatial Database
  (counties, vegetation_index,
   rainfall_data, climate_risk)
          |
   Node.js REST API
  (Express with 8 endpoints)
          |
  React Web Dashboard
  (Leaflet map + Chart.js)
          |
     End User
  (analyst, planner, NGO)
```

---

## Getting Started

### Prerequisites

Node.js v18 or higher, Python 3.10 or higher, PostgreSQL 13 or higher with PostGIS extension, Google Earth Engine account for data extraction.

### Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/njerinjuguna-svg/kenya-climate-intelligence-platform.git
cd kenya-climate-intelligence-platform
```

**2. Set up the backend**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=3000
DB_HOST=localhost
DB_NAME=climate_platform
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**3. Set up the database**
```bash
psql -U postgres
CREATE DATABASE climate_platform;
\c climate_platform
CREATE EXTENSION postgis;
```

Run the table creation scripts from `docs/schema.sql`

**4. Set up Python scripts**
```bash
cd scripts
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**5. Set up the frontend**
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000
```

**6. Start the application**

Terminal 1 for the backend:
```bash
cd backend && node server.js
```

Terminal 2 for the frontend:
```bash
cd frontend && npm start
```

Open `http://localhost:3001`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | API health check |
| GET | /counties | All 47 counties |
| GET | /counties/geojson | Counties as GeoJSON for map rendering |
| GET | /counties/:id/ndvi | NDVI trend for a specific county |
| GET | /counties/:id/rainfall | Rainfall trend for a specific county |
| GET | /climate-risk | Climate risk scores for all counties |
| GET | /climate-risk/:id | Risk data for a specific county |
| GET | /rainfall | All rainfall data |
| GET | /vegetation | All vegetation index data |
| POST | /auth/register | Register new analyst |
| POST | /auth/login | Login and receive JWT token |

---

## Project Structure

```
kenya-climate-intelligence-platform/
    backend/
        controllers/        Route handlers
        middleware/         JWT authentication
        models/             Database models
        routes/             API routes
        db.js               Database connection
        server.js           Express app entry point
    frontend/
        src/
            components/     React components
                KenyaMap.js
                CountyPanel.js
                ClimateCharts.js
                ReportGenerator.js
                SearchBar.js
                Header.js
            pages/          Page components
                Dashboard.js
                Login.js
            services/
                api.js      API calls
    scripts/
        db_connect.py
        fetch_counties.py
        calculate_risk.py
        update_risk_scores.py
        load_ndvi_data.py
        load_rainfall_data.py
    data/                   GEE exported datasets
    docs/                   Documentation
```

---

## Roadmap

FME automated data pipelines for scheduled updates. Land cover change layer on the map. Google Earth Engine Python API integration for direct database updates. Time slider for comparing NDVI across years on the map. County to county comparison tool. Automated PDF report scheduling via email. Mobile app built with React Native. Integration with Kenya Open Data Portal.

---

## About the Author

**Fides Njeri** is a geospatial engineer and backend developer based in Kenya, currently completing a one year software development fellowship while building at the intersection of GIS and full stack engineering.

Her academic background is in **Geomatics and Geospatial Information Systems**, giving her a foundation in spatial data, remote sensing, and geographic analysis. The fellowship added production grade backend engineering to that foundation including Node.js, RESTful APIs, database design, authentication systems, and deployment pipelines.

This project sits at the center of both worlds.

The decision to build a climate intelligence platform was not arbitrary. Kenya's climate crisis is visible, measurable, and urgent. The tools to monitor it have existed for years in the form of satellite data and open datasets. What was missing was someone willing to pull those tools together into something accessible to the people making decisions on the ground. That gap felt worth closing.

The platform was built entirely from scratch over the course of the fellowship including the database schema, API, Python data pipeline, React frontend, and GEE integration. It is a demonstration that geospatial intelligence work does not have to live in desktop GIS software alone. It can live on the web, in the hands of anyone with a browser.

---

## Contact

**Fides Njeri**
GitHub: [@njerinjuguna-svg](https://github.com/njerinjuguna-svg)

---

## License

MIT License. Open for use, adaptation, and collaboration.

---

*Built with real data. Built for real decisions. Built in Kenya.*
