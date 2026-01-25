import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './MainScreen.css';

const Mainscreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [lastUpdated, setLastUpdated] = useState("");
  
  // New State for the Notification Popup
  const [showNotification, setShowNotification] = useState(false);

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
      // Trigger the notification
      setShowNotification(true);
      
      // Hide it after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
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

  const filteredOrders = orders.filter((row) => {
    const rowValues = Object.values(row).join(" ").toLowerCase();
    const matchesSearch = rowValues.includes(searchTerm.toLowerCase());
    const currentStatus = statusMap[row['Timestamp']] || 'Pending';
    const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <h1 className="dashboard-title">Order Dashboard</h1>
        
        {/* Link Card */}
        <div className="link-card">
          <h3>Customer Order Link</h3>
          <p>Click below to copy the link:</p>
          <div className="copy-wrapper">
            <input type="text" readOnly value={formLink} className="link-input"/>
            <button onClick={handleCopyLink} className="copy-button">
              Copy Link
            </button>
          </div>
          <div style={{ marginTop: '10px' }}>
            <a href={formLink} target="_blank" rel="noopener noreferrer" className="test-link">Open/Test Link ↗</a>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-section">
        <div className="table-header-row">
          <div className="title-group">
            <h2>Orders List</h2>
            {lastUpdated && <span className="last-updated">Updated: {lastUpdated}</span>}
          </div>

          <div className="table-actions">
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

        {/* DATA TABLE */}
        {loading ? (
          <p className="loading-text">Loading orders...</p>
        ) : filteredOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  {Object.keys(orders[0]).map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                  <th className="sticky-col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((row, rowIndex) => {
                  const rowId = row['Timestamp']; 
                  const currentStatus = statusMap[rowId] || 'Pending';
                  return (
                    <tr key={rowIndex}>
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
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* --- NOTIFICATION POPUP (Toast) --- */}
      <div className={`toast-notification ${showNotification ? 'show' : ''}`}>
         Link Copied Successfully!
      </div>

    </div>
  );
};

export default Mainscreen;