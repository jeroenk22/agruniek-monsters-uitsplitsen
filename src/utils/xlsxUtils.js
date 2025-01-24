import * as XLSX from 'xlsx';

/**
 * Verwerkt een geüpload Excel-bestand en retourneert de data, ordernummers, en totaal aantal rijen.
 * @param {File} file - Het geüploade Excel-bestand.
 * @returns {Promise} - Een promise met de gestructureerde data, ordernummers, en totaal aantal rijen.
 */
export const processFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    // Helper-functie om Excel-datums om te zetten naar leesbare datums
    const convertExcelDate = (excelDate) => {
      const date = new Date((excelDate - 25569) * 86400 * 1000); // 25569 is de Excel-epoch
      return date.toLocaleDateString('nl-NL'); // Geeft de datum terug in dd-mm-jjjj formaat
    };

    // Callback voor bestand inladen
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Controleer of de sheet gegevens bevat
      if (!jsonSheet.length) {
        resolve({ data: {}, orders: new Set(), total: 0 }); // Geen data gevonden
        return;
      }

      const headers = jsonSheet[0]; // Eerste rij bevat headers
      const requiredHeaders = [
        'Order, sleutel',
        'Afronding (tot), eerste taak',
        'Naam, eerste taak',
        'Straat, eerste taak',
        'Plaats, eerste taak',
        'Colliomschrijving, eerste taak',
        'Excl BTW',
      ];

      // Controleer of verplichte headers aanwezig zijn
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length) {
        alert(`Ontbrekende kolommen: ${missingHeaders.join(', ')}`);
        resolve({ data: {}, orders: new Set(), total: 0 }); // Retourneer lege resultaten
        return;
      }

      // Vind indexen van de kolommen
      const colIndexes = {
        orderKey: headers.indexOf('Order, sleutel'),
        roundingDate: headers.indexOf('Afronding (tot), eerste taak'),
        name: headers.indexOf('Naam, eerste taak'),
        street: headers.indexOf('Straat, eerste taak'),
        place: headers.indexOf('Plaats, eerste taak'),
        description: headers.indexOf('Colliomschrijving, eerste taak'),
      };

      const groupedData = {};
      const allOrderNumbers = new Set();
      let totalRows = 0;

      // Verwerk elke rij (behalve de header-rij)
      jsonSheet.slice(1).forEach((row) => {
        const description = row[colIndexes.description]?.split(',') || [];
        const orderKey = row[colIndexes.orderKey] || 'Onbekend';
        const roundingDateRaw = row[colIndexes.roundingDate] || 'Onbekend';

        // Converteer de datum als deze een getal is
        const roundingDate = !isNaN(roundingDateRaw)
          ? convertExcelDate(parseFloat(roundingDateRaw))
          : roundingDateRaw;

        const location = `${row[colIndexes.name] || 'Onbekend'} (${row[colIndexes.place] || 'Onbekend'})`;
        const street = row[colIndexes.street] || 'Onbekend';

        // Verwerk elke beschrijving
        description.forEach((desc) => {
          const cleanedDesc = desc.trim().replace(/^•? *\d+x\s*Mo\s*/, '');
          if (!groupedData[cleanedDesc]) groupedData[cleanedDesc] = [];
          groupedData[cleanedDesc].push({ orderKey, roundingDate, location, street });
          allOrderNumbers.add(orderKey);
          totalRows++;
        });
      });

      // Sorteer groupedData op aantal entries (van groot naar klein)
      const sortedGroupedData = Object.entries(groupedData)
        .sort((a, b) => b[1].length - a[1].length)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      resolve({ data: sortedGroupedData, orders: allOrderNumbers, total: totalRows });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Genereert een Excel-bestand met gestructureerde data per groep.
 * @param {Object} groupedData - De data gegroepeerd per beschrijving.
 */
export const generateExcel = (groupedData) => {
  if (!groupedData || Object.keys(groupedData).length === 0) {
    throw new Error('Geen geldige data beschikbaar voor export.');
  }

  const workbook = XLSX.utils.book_new();

  // Voeg voor elke groep een apart tabblad toe
  Object.entries(groupedData).forEach(([group, entries]) => {
    const worksheetData = [['Datum', 'Locatie', 'Adres', 'Ordernummer']];

    entries.forEach((entry) => {
      worksheetData.push([
        entry.roundingDate, // Datum is al correct omgezet in processFile
        entry.location,
        entry.street,
        entry.orderKey,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, group);
  });

  XLSX.writeFile(workbook, 'Monsters_Export.xlsx');
};
