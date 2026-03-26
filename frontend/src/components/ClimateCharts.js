import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getNDVITrend, getRainfallTrend } from '../services/api';
import './ClimateCharts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClimateCharts = ({ county }) => {
  const [ndviData, setNdviData] = useState([]);
  const [rainfallData, setRainfallData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!county || !county.ogc_fid) return;

    const fetchChartData = async () => {
      setLoading(true);
      try {
        const [ndvi, rainfall] = await Promise.all([
          getNDVITrend(county.ogc_fid),
          getRainfallTrend(county.ogc_fid)
        ]);
        setNdviData(ndvi);
        setRainfallData(rainfall);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
      setLoading(false);
    };

    fetchChartData();
  }, [county]);

  if (!county) return null;
  if (loading) return <div className="chart-loading">Loading charts...</div>;
  if (ndviData.length === 0) return null;

  // ---- NDVI CHART ----
  // Get min and max of actual data to zoom the chart
  const ndviValues = ndviData.map(d => parseFloat(d.ndvi_value));
  const ndviMin = Math.max(0, Math.min(...ndviValues) - 0.05);
  const ndviMax = Math.min(1, Math.max(...ndviValues) + 0.05);

  // Helper to get NDVI health label
  const getNDVILabel = (value) => {
    if (value >= 0.6) return 'Healthy Forest';
    if (value >= 0.4) return 'Moderate';
    if (value >= 0.2) return 'Sparse';
    return 'Bare/Desert';
  };

  // Helper to get NDVI point color
  const getNDVIColor = (value) => {
    if (value >= 0.6) return '#27ae60';
    if (value >= 0.4) return '#f39c12';
    if (value >= 0.2) return '#e67e22';
    return '#e74c3c';
  };

  const ndviLabels = ndviData.map(d => new Date(d.date).getFullYear());

  const ndviChartData = {
    labels: ndviLabels,
    datasets: [{
      label: 'NDVI Value',
      data: ndviValues.map(v => parseFloat(v.toFixed(4))),
      borderColor: '#2c7a4b',
      backgroundColor: 'rgba(44, 122, 75, 0.1)',
      pointBackgroundColor: ndviValues.map(v => getNDVIColor(v)),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 10,
      pointHoverRadius: 12,
      tension: 0.3,
      fill: true,
      borderWidth: 3,
    }]
  };

  const ndviOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `🌿 Vegetation Health (NDVI) — ${county.adm1_name}`,
        font: { size: 13, weight: 'bold' },
        color: '#1a5c38',
        padding: { bottom: 15 }
      },
      tooltip: {
        callbacks: {
          title: (items) => `Year: ${items[0].label}`,
          label: (context) => {
            const val = parseFloat(context.raw);
            return `NDVI: ${val.toFixed(4)}`;
          },
          afterLabel: (context) => {
            const val = parseFloat(context.raw);
            return `Health: ${getNDVILabel(val)}`;
          }
        },
        backgroundColor: 'rgba(26,92,56,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        // Zoom to actual data range so variation is visible
        min: parseFloat(ndviMin.toFixed(2)),
        max: parseFloat(ndviMax.toFixed(2)),
        title: {
          display: true,
          text: 'NDVI Value',
          font: { size: 11 }
        },
        ticks: {
          callback: (value) => {
            const v = parseFloat(value.toFixed(2));
            const label = getNDVILabel(v);
            return `${v} (${label})`;
          },
          font: { size: 10 },
          maxTicksLimit: 6,
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          font: { size: 11 }
        },
        grid: { display: false }
      }
    }
  };

  // ---- RAINFALL CHART ----
  const rainfallValues = rainfallData.map(d => parseFloat(d.rainfall_mm));
  const rainfallMin = Math.max(0, Math.min(...rainfallValues) - 100);
  const rainfallMax = Math.max(...rainfallValues) + 100;

  const getRainfallColor = (mm) => {
    if (mm < 500) return { bg: 'rgba(231,76,60,0.85)', border: 'rgba(231,76,60,1)' };
    if (mm < 800) return { bg: 'rgba(243,156,18,0.85)', border: 'rgba(243,156,18,1)' };
    if (mm < 1200) return { bg: 'rgba(52,152,219,0.85)', border: 'rgba(52,152,219,1)' };
    return { bg: 'rgba(39,174,96,0.85)', border: 'rgba(39,174,96,1)' };
  };

  const getRainfallLabel = (mm) => {
    if (mm < 500) return 'Very Dry — Drought risk';
    if (mm < 800) return 'Dry — Below average';
    if (mm < 1200) return 'Normal — Adequate';
    return 'Wet — Above average';
  };

  const rainfallLabels = rainfallData.map(d => new Date(d.date).getFullYear());

  const rainfallChartData = {
    labels: rainfallLabels,
    datasets: [{
      label: 'Annual Rainfall (mm)',
      data: rainfallValues.map(v => parseFloat(v.toFixed(1))),
      backgroundColor: rainfallValues.map(v => getRainfallColor(v).bg),
      borderColor: rainfallValues.map(v => getRainfallColor(v).border),
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const rainfallOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `🌧️ Annual Rainfall — ${county.adm1_name}`,
        font: { size: 13, weight: 'bold' },
        color: '#1a5c38',
        padding: { bottom: 15 }
      },
      tooltip: {
        callbacks: {
          title: (items) => `Year: ${items[0].label}`,
          label: (context) => {
            const mm = parseFloat(context.raw);
            return `Rainfall: ${mm.toFixed(0)}mm`;
          },
          afterLabel: (context) => {
            const mm = parseFloat(context.raw);
            return getRainfallLabel(mm);
          }
        },
        backgroundColor: 'rgba(26,92,56,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        // Zoom to actual data range so bars show variation
        min: parseFloat(rainfallMin.toFixed(0)),
        max: parseFloat(rainfallMax.toFixed(0)),
        title: {
          display: true,
          text: 'Rainfall (mm)',
          font: { size: 11 }
        },
        ticks: {
          callback: (value) => `${value}mm`,
          font: { size: 10 },
          maxTicksLimit: 6,
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          font: { size: 11 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="climate-charts">
      <div className="chart-wrapper">
        <Line data={ndviChartData} options={ndviOptions} />
      </div>
      <div className="chart-wrapper">
        <Bar data={rainfallChartData} options={rainfallOptions} />
      </div>
      <div className="chart-legend">
        <h4>🌿 NDVI Guide</h4>
        <div className="legend-items">
          <span className="legend-item red">■ 0.0–0.2 — Desert / Bare soil</span>
          <span className="legend-item orange">■ 0.2–0.4 — Sparse vegetation</span>
          <span className="legend-item blue">■ 0.4–0.6 — Moderate vegetation</span>
          <span className="legend-item green">■ 0.6–1.0 — Healthy / Dense forest</span>
        </div>
        <h4 style={{marginTop: '10px'}}>🌧️ Rainfall Guide</h4>
        <div className="legend-items">
          <span className="legend-item red">■ Below 500mm — Very Dry / Drought</span>
          <span className="legend-item orange">■ 500–800mm — Dry / Below average</span>
          <span className="legend-item blue">■ 800–1200mm — Normal / Adequate</span>
          <span className="legend-item green">■ Above 1200mm — Wet / Above average</span>
        </div>
      </div>
    </div>
  );
};

export default ClimateCharts;