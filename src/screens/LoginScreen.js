import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import './MainScreen.css';

const Mainscreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // New Filter State
  const [lastUpdated, setLastUpdated] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("Copy Link");
  
  // State to store statuses locally
  const [statusMap, setStatusMap] = useState({});

  const formLink = "https://forms.gle/c8dWpwUKuonCpfSX8";
  const sheetCSVLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQh9F3shvo88vrBvqEbhOcKkaIJgjFTHN_vjzTlR-bxlFPZBRMaf069NsQEtPel7C68MDR7p_6zzOsI/pub?gid=1558447114&single=true&output=csv"; 

  useEffect(() => {
    const savedStatuses = localStorage.getItem("order_statuses");
    if (savedStatuses) {
      setStatusMap(JSON.parse(savedStatuses));
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink).then(() => {
      setCopyFeedback("Copied! ✅");
      setTimeout(() => setCopyFeedback("Copy Link"), 2000);
    });
  };

  const fetchData = () => {
    setLoading(true);
    Papa.parse(sheetCSVLink, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newestFirst = results.data.reverse();
        setOrders(newestFirst);
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      },
      error: (err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = (timestamp, newStatus) => {
    const updatedMap = { ...statusMap, [timestamp]: newStatus };
    setStatusMap(updatedMap);
    localStorage.setItem("order_statuses", JSON.stringify(updatedMap));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'status-approved';
      case 'Declined': return 'status-declined';
      default: return 'status-pending';
    }
  };

  // --- NEW: Calculate Stats Dynamically ---
  const stats = useMemo(() => {
    const total = orders.length;
    let pending = 0;
    let approved = 0;
    let declined = 0;

    orders.forEach(order => {
      const status = statusMap[order.Timestamp] || 'Pending';
      if (status === 'Pending') pending++;
      if (status === 'Approved') approved++;
      if (status === 'Declined') declined++;
    });

    return { total, pending, approved, declined };
  }, [orders, statusMap]);

  // --- UPDATED: Filtering Logic (Text + Status) ---
  const filteredOrders = orders.filter((row) => {
    // 1. Text Search
    const rowValues = Object.values(row).join(" ").toLowerCase();
    const matchesSearch = rowValues.includes(searchTerm.toLowerCase());

    // 2. Status Filter
    const currentStatus = statusMap[row['Timestamp']] || 'Pending';
    const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <h1 className="dashboard-title">Order Dashboard</h1>
        
        {/* STATS CARDS (New Feature) */}
        {!loading && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card card-pending">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
            <div className="stat-card card-approved">
              <span className="stat-label">Approved</span>
              <span className="stat-value">{stats.approved}</span>
            </div>
            {/* Optional Link Card Button embedded in header */}
            <div className="stat-card action-card">
              <span className="stat-label">New Order?</span>
              <button onClick={handleCopyLink} className="mini-copy-btn">
                🔗 {copyFeedback}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="table-section">
        <div className="table-header-row">
          <div className="title-group">
            <h2>Orders List</h2>
            {lastUpdated && <span className="last-updated">Updated: {lastUpdated}</span>}
          </div>

          <div className="table-actions">
            {/* Status Filter Dropdown */}
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Show All</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Approved">✅ Approved</option>
              <option value="Declined">❌ Declined</option>
            </select>

            <input 
              type="text" 
              placeholder="🔍 Search details..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <button onClick={fetchData} className="refresh-button">↻</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing with Google Sheets...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  {Object.keys(orders[0]).map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                  <th className="sticky-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((row, rowIndex) => {
                  const rowId = row['Timestamp']; 
                  const currentStatus = statusMap[rowId] || 'Pending';

                  return (
                    <tr key={rowIndex} className="fade-in-row">
                      {Object.values(row).map((val, colIndex) => (
                        <td key={colIndex}>{val}</td>
                      ))}
                      
                      <td className="sticky-col">
                        <select 
                          className={`status-select ${getStatusColor(currentStatus)}`}
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(rowId, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No orders found matching your filters.</p>
            {statusFilter !== "All" && (
              <button className="clear-filter-btn" onClick={() => setStatusFilter("All")}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mainscreen;