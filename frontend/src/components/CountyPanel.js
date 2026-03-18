import React from 'react';
import './CountyPanel.css';

const CountyPanel = ({ county }) => {
  if (!county) {
    return (
      <div className="county-panel">
        <div className="no-selection">
          <h3>Kenya Climate Monitor</h3>
          <p>Click on any county on the map to see its climate data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="county-panel">
      <h2>{county.adm1_name} County</h2>
      <div className="county-stats">
        <div className="stat-card">
          <span className="stat-label">Drought Risk</span>
          <span className="stat-value">{county.drought_risk || 'No data'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Flood Risk</span>
          <span className="stat-value">{county.flood_risk || 'No data'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rainfall Trend</span>
          <span className="stat-value">{county.rainfall_trend || 'No data'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Vegetation Change</span>
          <span className="stat-value">
            {county.vegetation_change ? `${county.vegetation_change}%` : 'No data'}
          </span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-label">Overall Risk Score</span>
          <span className="stat-value large">
            {county.risk_score ? `${county.risk_score} / 10` : 'No data'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Area</span>
          <span className="stat-value">
            {county.area_sqkm ? `${Math.round(county.area_sqkm)} km²` : 'No data'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountyPanel;