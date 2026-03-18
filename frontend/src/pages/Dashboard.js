import React, { useState, useEffect } from 'react';
import { getClimateRisk } from '../services/api';
import KenyaMap from '../components/KenyaMap';
import CountyPanel from '../components/CountyPanel';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [climateData, setClimateData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClimateRisk();
        setClimateData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching climate data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-body">
        {loading ? (
          <div className="loading">Loading climate data...</div>
        ) : (
          <>
            <KenyaMap
              climateData={climateData}
              onCountySelect={setSelectedCounty}
            />
            <CountyPanel county={selectedCounty} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;