import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './KenyaMap.css';
import axios from 'axios';

const KenyaMap = ({ climateData, onCountySelect }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Fetch Kenya county boundaries as GeoJSON from our API
    axios.get('http://localhost:3000/counties/geojson')
      .then(res => setGeoData(res.data))
      .catch(err => console.error('Error loading map data:', err));
  }, []);

  const getCountyColor = (countyName) => {
  const countyData = climateData.find(d => d.adm1_name === countyName);
  if (!countyData || !countyData.risk_score) return '#gray';
  
  const score = parseFloat(countyData.risk_score);
  if (score >= 8) return '#d73027';      // Red - Very High risk
  if (score >= 6) return '#fc8d59';      // Orange - High risk
  if (score >= 4) return '#fee08b';      // Yellow - Medium risk
  return '#91cf60';                       // Green - Low risk
};

const getCountyStyle = (feature) => ({
  fillColor: getCountyColor(feature.properties.adm1_name),
  weight: 1,
  opacity: 1,
  color: 'white',
  fillOpacity: 0.7,
});

  const onEachCounty = (feature, layer) => {
    const countyName = feature.properties.adm1_name;
    const countyData = climateData.find(d => d.adm1_name === countyName);

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.9, weight: 2 });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.6, weight: 1 });
      },
      click: () => {
        onCountySelect(countyData || { adm1_name: countyName });
      }
    });

    layer.bindTooltip(countyName, { permanent: false, sticky: true });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[0.0236, 37.9062]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getCountyStyle}
            onEachFeature={onEachCounty}
          />
        )}
      </MapContainer>
      <div className="map-legend">
  <h4>Risk Score</h4>
  <div><span style={{background:'#d73027'}}></span> Very High (8-10)</div>
  <div><span style={{background:'#fc8d59'}}></span> High (6-8)</div>
  <div><span style={{background:'#fee08b'}}></span> Medium (4-6)</div>
  <div><span style={{background:'#91cf60'}}></span> Low (0-4)</div>
</div>
    </div>
  );
};

export default KenyaMap;