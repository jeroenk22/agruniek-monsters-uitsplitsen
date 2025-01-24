import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Summary from './components/Summary';
import { processFile } from './utils/xlsxUtils';

const App = () => {
  const [groupedData, setGroupedData] = useState({});
  const [allOrderNumbers, setAllOrderNumbers] = useState(new Set());
  const [totalRows, setTotalRows] = useState(0);

  const handleFileUpload = async (file) => {
    const { data, orders, total } = await processFile(file);
  
    setGroupedData(data || {}); // Altijd een object instellen
    setAllOrderNumbers(orders || new Set());
    setTotalRows(total || 0);
  };

  const handleCopyOrders = () => {
    navigator.clipboard.writeText(Array.from(allOrderNumbers).join(', '))
      .then(() => alert('Order nummers gekopieerd naar het klembord!'))
      .catch(err => alert(`Kopiëren mislukt: ${err}`));
  };

  return (
    <div className="App">
      <h1>Agruniek monsters uitsplitsen</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <Summary totalRows={totalRows} onCopyOrders={handleCopyOrders} groupedData={groupedData} />
      <DataTable groupedData={groupedData} />
    </div>
  );
};

export default App;

