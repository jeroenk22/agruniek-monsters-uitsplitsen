import React, { useState } from 'react';
import styles from './DataTable.module.css';

const DataTable = ({ groupedData }) => {
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });

  if (!groupedData || Object.keys(groupedData).length === 0) {
    return <p>Geen gegevens beschikbaar.</p>;
  }

  const handleSort = (group, column) => {
    const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column, direction: newDirection });

    groupedData[group] = [...groupedData[group]].sort((a, b) => {
      if (a[column] < b[column]) return newDirection === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderTables = () => {
    return Object.entries(groupedData).map(([group, entries]) => (
      <div key={group} className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>{group} (Aantal: {entries.length}):</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th
                onClick={() => handleSort(group, 'roundingDate')}
                className={styles.sortable}
              >
                Datum {sortConfig.column === 'roundingDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort(group, 'location')}
                className={styles.sortable}
              >
                Locatie {sortConfig.column === 'location' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort(group, 'street')}
                className={styles.sortable}
              >
                Adres {sortConfig.column === 'street' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort(group, 'orderKey')}
                className={styles.sortable}
              >
                Ordernummer {sortConfig.column === 'orderKey' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.roundingDate}</td>
                <td>{entry.location}</td>
                <td>{entry.street}</td>
                <td>{entry.orderKey}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return <div>{renderTables()}</div>;
};

export default DataTable;
