import React, { useState, useEffect } from 'react';
import { getClimateRisk, getCounties } from '../services/api';
import KenyaMap from '../components/KenyaMap';
import CountyPanel from '../components/CountyPanel';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [climateData, setClimateData] = useState([]);
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [climate, countyList] = await Promise.all([
          getClimateRisk(),
          getCounties()
        ]);
        setClimateData(climate);
        setCounties(countyList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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
              counties={counties}
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