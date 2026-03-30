import React from 'react';
import ClimateCharts from './ClimateCharts';
import ReportGenerator from './ReportGenerator';
import './CountyPanel.css';

const CountyPanel = ({ county }) => {
  if (!county) {
    return (
      <div className="county-panel">
        <div className="no-selection">
          <h3>🌍 Kenya Climate Monitor</h3>
          <p>Click on any county on the map to see its climate data and trends.</p>
          <div className="hint-cards">
            <div className="hint-card">🌧️ Real rainfall data from CHIRPS satellite</div>
            <div className="hint-card">🌿 Real NDVI vegetation from MODIS satellite</div>
            <div className="hint-card">⚠️ Risk scores calculated from real data</div>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    if (risk === 'High') return '#e74c3c';
    if (risk === 'Medium') return '#f39c12';
    return '#27ae60';
  };

  const getRiskScoreColor = (score) => {
    if (score >= 8) return '#e74c3c';
    if (score >= 6) return '#e67e22';
    if (score >= 4) return '#f39c12';
    return '#27ae60';
  };

  return (
    <div className="county-panel">
      <h2>{county.adm1_name} County</h2>
      <div className="county-stats">
        <div className="stat-card">
          <span className="stat-label">Drought Risk</span>
          <span className="stat-value" style={{color: getRiskColor(county.drought_risk)}}>
            {county.drought_risk || 'No data'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Flood Risk</span>
          <span className="stat-value" style={{color: getRiskColor(county.flood_risk)}}>
            {county.flood_risk || 'No data'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rainfall Trend</span>
          <span className="stat-value">{county.rainfall_trend || 'No data'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Vegetation Change</span>
          <span className="stat-value" style={{
            color: county.vegetation_change < 0 ? '#e74c3c' : '#27ae60'
          }}>
            {county.vegetation_change ? `${county.vegetation_change}%` : 'No data'}
          </span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-label">Overall Risk Score</span>
          <span className="stat-value large" style={{
            color: getRiskScoreColor(county.risk_score)
          }}>
            {county.risk_score ? `${county.risk_score} / 10` : 'No data'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Area</span>
          <span className="stat-value">
            {county.area_sqkm ? `${Math.round(county.area_sqkm).toLocaleString()} km²` : 'No data'}
          </span>
        </div>
      </div>

      {/* PDF Report Button */}
      <ReportGenerator county={county} />

      {/* Charts */}
      <ClimateCharts county={county} />
    </div>
  );
};

export default CountyPanel;