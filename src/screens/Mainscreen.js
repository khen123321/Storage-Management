import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './MainScreen.css';

const Mainscreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  
  // State for the "Copied!" message
  const [copyFeedback, setCopyFeedback] = useState("Copy Link");

  const formLink = "https://forms.gle/c8dWpwUKuonCpfSX8";
  const sheetCSVLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQh9F3shvo88vrBvqEbhOcKkaIJgjFTHN_vjzTlR-bxlFPZBRMaf069NsQEtPel7C68MDR7p_6zzOsI/pub?gid=1558447114&single=true&output=csv"; 

  // Function to handle copying
  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink).then(() => {
      setCopyFeedback("Copied! ✅");
      setTimeout(() => setCopyFeedback("Copy Link"), 2000); // Reset text after 2 seconds
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
        setLastUpdated(new Date().toLocaleTimeString());
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

  const filteredOrders = orders.filter((row) => {
    const rowValues = Object.values(row).join(" ").toLowerCase();
    return rowValues.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="dashboard-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <h1 className="dashboard-title">Order Management</h1>
        
        {/* UPDATED LINK CARD WITH COPY FUNCTION */}
        <div className="link-card">
          <h3>Customer Order Link</h3>
          <p>Click below to copy the link and send it to your customer:</p>
          
          <div className="copy-wrapper">
            <input 
              type="text" 
              readOnly 
              value={formLink} 
              className="link-input"
            />
            <button onClick={handleCopyLink} className="copy-button">
              {copyFeedback}
            </button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <a href={formLink} target="_blank" rel="noopener noreferrer" className="test-link">
              Open/Test Link ↗
            </a>
          </div>
        </div>
      </div>

      {/* CONTROLS SECTION */}
      <div className="controls-section">
        <input 
          type="text" 
          placeholder="🔍 Search orders..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="refresh-container">
          <span className="last-updated">Updated: {lastUpdated}</span>
          <button onClick={fetchData} className="refresh-button">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-section">
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
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((val, colIndex) => (
                      <td key={colIndex}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No orders found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Mainscreen;