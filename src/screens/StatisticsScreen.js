import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './StatisticsScreen.css';

const StatisticsScreen = () => {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    dailyCounts: [],
    topItems: [],
    categoryName: '',
    avgPerDay: 0
  });
  const [loading, setLoading] = useState(true);

  // Premium Brown Palette for Donut
  const COLORS = ['#3e2723', '#5d4037', '#8d6e63', '#a1887f', '#d7ccc8'];

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
    
    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
    // Tries to find a "Category" or "Item" column (usually column 2 or 3 in standard forms)
    const categoryKey = keys.length > 2 ? keys[2] : (keys.length > 1 ? keys[1] : null);

    rows.forEach(row => {
      if (row.Timestamp) {
        const rowDateObj = new Date(row.Timestamp);
        const rowDateStr = rowDateObj.toLocaleDateString();
        if (rowDateStr === todayStr) todayCount++;
        dateCounts[rowDateStr] = (dateCounts[rowDateStr] || 0) + 1;
      }
      if (categoryKey && row[categoryKey]) {
        const val = row[categoryKey].trim();
        itemFrequency[val] = (itemFrequency[val] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dateCounts).slice(-7);
    const sortedItems = Object.entries(itemFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const activeDays = Object.keys(dateCounts).length;
    const avgPerDay = activeDays > 0 ? (total / activeDays).toFixed(1) : 0;

    setStats({
      total,
      today: todayCount,
      dailyCounts: sortedDates.map(date => ({ date, count: dateCounts[date] })),
      topItems: sortedItems,
      categoryName: categoryKey,
      avgPerDay
    });
  };

  const getConicGradient = () => {
    let currentDeg = 0;
    const totalTop = stats.topItems.reduce((acc, curr) => acc + curr[1], 0);
    if (totalTop === 0) return 'conic-gradient(#efebe9 0% 100%)';

    const segments = stats.topItems.map((item, index) => {
      const value = item[1];
      const deg = (value / totalTop) * 360;
      const color = COLORS[index % COLORS.length];
      const segmentString = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
      currentDeg += deg;
      return segmentString;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  if (loading) return <div className="loading-screen">Calculating Statistics...</div>;

  return (
    <div className="stats-container">
      <div className="header-text-group">
        <h1 className="stats-main-title">Analytics Overview</h1>
        <p className="stats-subtitle">Real-time data from your orders</p>
      </div>

      <div className="cards-grid">
        {/* TOTAL ORDERS */}
        <div className="stat-card">
          <div className="card-header-group">
            <span className="card-label">Total Orders</span>
            <div className="card-body">
              <div className="icon-wrapper brown">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <span className="big-number">{stats.total}</span>
            </div>
          </div>
          <span className="card-sub-text">All time entries</span>
        </div>
        
        {/* NEW TODAY */}
        <div className="stat-card">
          <div className="card-header-group">
             <span className="card-label">New Today</span>
             <div className="card-body">
              <div className="icon-wrapper green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span className="big-number">{stats.today}</span>
            </div>
          </div>
          <span className="card-sub-text">Orders received today</span>
        </div>

        {/* PERFORMANCE */}
        <div className="stat-card">
           <div className="card-header-group">
            <span className="card-label">Daily Average</span>
            <div className="card-body">
              <div className="icon-wrapper brown">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <span className="big-number">{stats.avgPerDay}</span>
            </div>
           </div>
           <span className="card-sub-text">Orders per active day</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-container">
          <h2>Activity Trend (Last 7 Days)</h2>
          <div className="bar-chart">
            {stats.dailyCounts.length > 0 ? (
              stats.dailyCounts.map((day, index) => {
                const maxVal = Math.max(...stats.dailyCounts.map(d => d.count));
                const count = day.count;
                return (
                  <div key={index} className="bar-group">
                    {/* IMPORTANT: data-value is what the CSS uses to show the popup number 
                    */}
                    <div 
                      className="bar-visual" 
                      style={{ height: `${maxVal > 0 ? (count / maxVal) * 100 : 0}%` }}
                      data-value={count} 
                    ></div>
                    <span className="bar-label">{day.date.split('/')[0]}/{day.date.split('/')[1]}</span>
                  </div>
                );
              })
            ) : ( <p style={{textAlign:'center', width:'100%', marginTop:'50px'}}>No activity data yet.</p> )}
          </div>
        </div>

        <div className="list-container">
          <h2>Top Categories</h2>
          <p className="stats-subtitle" style={{marginBottom: '20px'}}>Distribution by Item</p>
          <div className="donut-layout">
            <div className="donut-chart" style={{ background: getConicGradient() }}>
              <div className="donut-hole"></div>
            </div>
            <div className="top-list">
              {stats.topItems.map(([name, count], index) => (
                <div key={index} className="list-row compact">
                   <span className="dot-indicator" style={{ background: COLORS[index % COLORS.length] }}></span>
                   <span className="item-name">{name}</span>
                   <span className="item-count">{count}</span>
                </div>
              ))}
              {stats.topItems.length === 0 && <p>No data available.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;