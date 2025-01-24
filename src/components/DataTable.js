import React from 'react';

const DataTable = ({ groupedData }) => {
  if (!groupedData || Object.keys(groupedData).length === 0) {
    return <p>Geen gegevens beschikbaar.</p>;
  }

  const renderTables = () => {
    return Object.entries(groupedData).map(([group, entries]) => (
      <div key={group}>
        <h3>{group} (Aantal: {entries.length}):</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Datum</th>
              <th>Locatie</th>
              <th>Adres</th>
              <th>Ordernummer</th>
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
