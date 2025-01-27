import React from 'react';
import { generateExcel } from '../utils/xlsxUtils';

const Summary = ({ totalRows, onCopyOrders, groupedData }) => {
  const handleDownload = () => {
    if (!groupedData || Object.keys(groupedData).length === 0) {
      alert('Geen gegevens beschikbaar om te downloaden.');
      return;
    }
    generateExcel(groupedData);
  };
  

  return (
    <div className="summary">
      <p>Totaal aantal monsters: {totalRows}</p>
      <button onClick={onCopyOrders}>Kopieër ordernummers</button>
      <button onClick={handleDownload} style={{ backgroundColor: '#28a745', color: 'white', marginLeft: '5px' }}>
        Download Excel
      </button>
    </div>
  );
};

export default Summary;
