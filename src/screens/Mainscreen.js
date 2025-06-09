import React, { useEffect, useState } from 'react';
import './MainScreen.css';

export default function MainScreen() {
  const [storageData, setStorageData] = useState([]);
  const [newestRow, setNewestRow] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formLink = 'https://forms.gle/zRJ1KJaVXAFNbkpC9';

  useEffect(() => {
    async function fetchData() {
      const url =
        'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbzXVu9DwM_5HtpP7wdzOHK8PDMa37D8YaEqbrjp3y96gUqJnM5vsMvGE1uPIBc8hL8E/exec';
      try {
        const response = await fetch(url);
        const data = await response.json();
        setStorageData(data);
        setNewestRow(data[data.length - 1]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        setCopySuccess('Link copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => setCopySuccess('Failed to copy link'));
  };

  // Filtered and paginated data (exclude newestRow)
  const filteredData = storageData
    .slice(0, -1)
    .filter(item =>
      Object.values(item)
        .some(val =>
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (storageData.length === 0) {
    return <div className="main-container">No storage data found yet.</div>;
  }

  return (
    <div className="main-container">
      <div className="card">
        <h1 className="title">📦 Management</h1>

        {/* Form Link Section */}
        <section className="section form-link-section">
          <h2 className="section-title">📝 Submit New Data</h2>
          <div className="form-link-wrapper">
            <input
              type="text"
              value={formLink}
              readOnly
              className="form-link-input"
              onFocus={(e) => e.target.select()}
            />
            <button onClick={copyToClipboard} className="copy-btn">
              Copy Link
            </button>
            <a
              href={formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="open-btn"
            >
              Open Form
            </a>
          </div>
          {copySuccess && <p className="copy-feedback">{copySuccess}</p>}
        </section>

        {/* Newest Entry */}
        <section className="section">
          <h2 className="section-title latest-entry-title">Latest Entry</h2>
          <table className="data-table newest-entry-table">
            <thead>
              <tr>
                {Object.keys(newestRow).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(newestRow).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search entries..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page when search changes
          }}
        />

        {/* All Storage Entries */}
        <section className="section">
          <h2 className="section-title">📋 All Entries</h2>
          <table className="data-table all-entries-table">
            <thead>
              <tr>
                {Object.keys(storageData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={
                    JSON.stringify(item) === JSON.stringify(newestRow)
                      ? 'highlight-row'
                      : ''
                  }
                >
                  {Object.values(item).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="page-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="page-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
