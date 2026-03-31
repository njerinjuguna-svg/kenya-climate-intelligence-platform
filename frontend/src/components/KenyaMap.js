import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './KenyaMap.css';
import axios from 'axios';
import SearchBar from './SearchBar';

// This component handles flying to a county when selected from search
const MapController = ({ selectedCounty, geoData }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedCounty || !geoData) return;

    const feature = geoData.features.find(
      f => f.properties.adm1_name === selectedCounty.adm1_name
    );

    if (feature) {
      const L = require('leaflet');
      const layer = L.geoJSON(feature);
      map.flyToBounds(layer.getBounds(), {
        padding: [50, 50],
        duration: 1.5
      });
    }
  }, [selectedCounty, geoData, map]); // ← add geoData and map here

  return null;
};
const KenyaMap = ({ climateData, onCountySelect, counties }) => {
  const [geoData, setGeoData] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/counties/geojson`)
      .then(res => setGeoData(res.data))
      .catch(err => console.error('Error loading map data:', err));
  }, []);

  const getCountyColor = (countyName) => {
    const countyData = climateData.find(d => d.adm1_name === countyName);
    if (!countyData || !countyData.risk_score) return '#cccccc';
    const score = parseFloat(countyData.risk_score);
    if (score >= 8) return '#d73027';
    if (score >= 6) return '#fc8d59';
    if (score >= 4) return '#fee08b';
    return '#91cf60';
  };

  const getCountyStyle = (feature) => ({
    fillColor: getCountyColor(feature.properties.adm1_name),
    weight: selectedCounty?.adm1_name === feature.properties.adm1_name ? 3 : 1,
    opacity: 1,
    color: selectedCounty?.adm1_name === feature.properties.adm1_name
      ? '#1a5c38' : 'white',
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
        e.target.setStyle({
          fillOpacity: 0.7,
          weight: selectedCounty?.adm1_name === countyName ? 3 : 1
        });
      },
      click: () => {
        const selected = countyData || { adm1_name: countyName };
        setSelectedCounty(selected);
        onCountySelect(selected);
      }
    });

    // Tooltip showing county name and risk score on hover
    const score = countyData?.risk_score;
    layer.bindTooltip(
      `<strong>${countyName}</strong>${score ? `<br/>Risk: ${score}/10` : ''}`,
      { permanent: false, sticky: true }
    );
  };

  // Handle county selected from search bar
 const handleSearchSelect = (county) => {
  // Find the full climate data for this county
  const fullCountyData = climateData.find(
    d => d.adm1_name === county.adm1_name
  );
  const selected = fullCountyData || county;
  setSelectedCounty(selected);
  onCountySelect(selected);
};
  return (
    <div className="map-container">
      {/* Search bar floating on top of map */}
      <div className="map-search">
        <SearchBar
          counties={counties || []}
          onCountySelect={handleSearchSelect}
        />
      </div>

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
            ref={geoJsonRef}
            data={geoData}
            style={getCountyStyle}
            onEachFeature={onEachCounty}
          />
        )}
        <MapController
          selectedCounty={selectedCounty}
          geoData={geoData}
        />
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