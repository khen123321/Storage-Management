import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './StatisticsScreen.css';

const StatisticsScreen = () => {
  // ✅ FIXED: Removed 'data' variable to clear the warning
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    dailyCounts: {},
    topItems: []
  });
  const [loading, setLoading] = useState(true);

  const sheetCSVLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQh9F3shvo88vrBvqEbhOcKkaIJgjFTHN_vjzTlR-bxlFPZBRMaf069NsQEtPel7C68MDR7p_6zzOsI/pub?gid=1558447114&single=true&output=csv";

  useEffect(() => {
    const fetchData = () => {
      Papa.parse(sheetCSVLink, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
          setLoading(false);
        },
        error: (err) => {
          console.error("Error fetching stats:", err);
          setLoading(false);
        }
      });
    };

    fetchData();
  }, []);

  const processData = (rows) => {
    const total = rows.length;
    let todayCount = 0;
    const dateCounts = {};
    const itemFrequency = {};

    const todayStr = new Date().toLocaleDateString();
    
    // Safety check for empty data
    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
    // Try to find a category column (usually index 2 or 1)
    const categoryKey = keys.length > 2 ? keys[2] : (keys.length > 1 ? keys[1] : null);

    rows.forEach(row => {
      if (row.Timestamp) {
        const rowDateObj = new Date(row.Timestamp);
        const rowDateStr = rowDateObj.toLocaleDateString();

        if (rowDateStr === todayStr) {
          todayCount++;
        }
        dateCounts[rowDateStr] = (dateCounts[rowDateStr] || 0) + 1;
      }

      if (categoryKey && row[categoryKey]) {
        const val = row[categoryKey].trim();
        itemFrequency[val] = (itemFrequency[val] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dateCounts).slice(-7);

    const sortedItems = Object.entries(itemFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setStats({
      total,
      today: todayCount,
      dailyCounts: sortedDates.map(date => ({ date, count: dateCounts[date] })),
      topItems: sortedItems,
      categoryName: categoryKey
    });
  };

  if (loading) return <div className="loading-screen">Calculating Statistics...</div>;

  return (
    <div className="stats-container">
      <h1 className="stats-title">Analytics Overview</h1>

      <div className="cards-grid">
        <div className="stat-card blue-card">
          <h3>Total Orders</h3>
          <p className="big-number">{stats.total}</p>
          <span className="card-sub">All time entries</span>
        </div>
        
        <div className="stat-card green-card">
          <h3>New Today</h3>
          <p className="big-number">{stats.today}</p>
          <span className="card-sub">Orders received today</span>
        </div>

        <div className="stat-card purple-card">
          <h3>Active Days</h3>
          <p className="big-number">{stats.dailyCounts.length}</p>
          <span className="card-sub">Days with activity</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>Activity Trend (Last 7 Active Days)</h2>
          <div className="bar-chart">
            {stats.dailyCounts.length > 0 ? (
              stats.dailyCounts.map((day, index) => {
                const maxVal = Math.max(...stats.dailyCounts.map(d => d.count));
                const heightPercent = maxVal > 0 ? (day.count / maxVal) * 100 : 0;
                
                return (
                  <div key={index} className="bar-group">
                    <div className="bar-visual" style={{ height: `${heightPercent}%` }}>
                      <span className="bar-tooltip">{day.count}</span>
                    </div>
                    <span className="bar-label">{day.date.split('/')[0]}/{day.date.split('/')[1]}</span>
                  </div>
                );
              })
            ) : (
              <p>No activity data yet.</p>
            )}
          </div>
        </div>

        <div className="list-container">
          <h2>Top Frequent Answers</h2>
          <p className="sub-header">Based on column: <strong>{stats.categoryName || "N/A"}</strong></p>
          
          <div className="top-list">
            {stats.topItems.map(([name, count], index) => (
              <div key={index} className="list-row">
                <span className="rank">#{index + 1}</span>
                <span className="item-name">{name}</span>
                <span className="item-count">{count} orders</span>
                <div className="mini-bar-bg">
                  <div 
                    className="mini-bar-fill" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.topItems.length === 0 && <p>No categorical data found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;