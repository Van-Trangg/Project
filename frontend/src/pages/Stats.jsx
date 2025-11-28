// src/pages/ProfileStatsPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { mockUserData } from '../api/mockChartData';
import { getStats } from '../api/map';
import StatsChart from '../components/StatsChart';
import '../styles/Stats.css';

// Helper component for a more minimal stat card
const StatCard = ({ title, value }) => (
  <div className="general-stat-card">
    <p className="stat-title">{title}</p>
    <p className="stat-value">{value.toLocaleString('de-DE')}</p>
  </div>
);

const Stats = () => {
  const [statData, setStatData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  // Get a list of unique years from the data
  const availableYears = useMemo(() => {
    if (statData.length === 0) return [new Date().getFullYear()];
    const years = [...new Set(statData.map(item => item.year))];
    return years.sort((a, b) => b - a); // Sort years descending
  }, [statData]);

  // Filter the data based on the selected year using useMemo for performance
  const filteredChartData = useMemo(() => {
    return statData.filter(item => item.year === selectedYear);
  }, [statData, selectedYear]);

  // Calculate summary stats from the filtered data
  const totalPointsInYear = useMemo(() => {
    return filteredChartData.reduce((acc, curr) => acc + curr.total_points, 0);
  }, [filteredChartData]);

  const totalTransactionsInYear = useMemo(() => {
    return filteredChartData.reduce((acc, curr) => acc + curr.transactions_count, 0);
  }, [filteredChartData]);

  useEffect(() => {
    setLoadingData(true);

    // Load stats
    getStats()
      .then(res => {
        const stats = res.data.statistics;
        setStatData(stats);
        console.log(stats);
        
        // Set the initial selected year to the most recent year from the data
        if (stats.length > 0) {
          const years = [...new Set(stats.map(item => item.year))];
          const latestYear = years.sort((a, b) => b - a)[0];
          setSelectedYear(latestYear);
        }
      })
      .catch(err => {
        console.error('Failed to load user stats', err);
        // Use mock data as fallback
        setStatData(mockUserData);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const handleBackRewards = () => {
    navigate('/reward');
  };

  return (
    <div className="stats-page">
      <header className="page-header">
        <button className="back-button-stats" onClick={handleBackRewards}>
          <img src="/src/public/back.png" width="18px" height="18px" alt="Back" />
        </button>
        <h1>Thống kê</h1>
      </header>

      <main>
        <section className="general-section">
          {/* --- YEAR SELECTOR --- */}
          <div className="chart-header">
            <h2>Thông tin tổng quát</h2>
            <div className="year-selector">
              <label htmlFor="year-select">Năm:</label>
              <select 
                id="year-select"
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <section className="summary-cards">
            <StatCard title={`Tổng thu nhập`} value={totalPointsInYear} />
            <StatCard title={`Tổng giao dịch`} value={totalTransactionsInYear} />
          </section>
        </section>
        <section className="chart-section">
          <div className="chart-header">
            <h2>Phân tích chi tiết</h2>
          </div>
          <StatsChart data={filteredChartData} />
        </section>
      </main>
    </div>
  );
};

export default Stats;