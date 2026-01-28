import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Export Bouteilles en PDF
export const exportBottlesToPDF = (bottles: any[]) => {
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text('Liste des Bouteilles de Gaz', 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  // Tableau
  autoTable(doc, {
    startY: 35,
    head: [['N° Série', 'Marque', 'Volume', 'Type', 'Poids', 'Localisation', 'Statut']],
    body: bottles.map(b => [
      b.serialNumber,
      b.gasBrand,
      `${b.gasVolume}L`,
      b.bottleType,
      `${b.weight}kg`,
      b.currentLocation,
      b.status
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  // Statistiques
  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(12);
  doc.text(`Total: ${bottles.length} bouteilles`, 14, finalY + 10);
  
  doc.save(`bouteilles_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Bouteilles en Excel
export const exportBottlesToExcel = (bottles: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    bottles.map(b => ({
      'Numéro de Série': b.serialNumber,
      'Marque de Gaz': b.gasBrand,
      'Volume (L)': b.gasVolume,
      'Type': b.bottleType,
      'Poids (kg)': b.weight,
      'Marque Bouteille': b.bottleBrand,
      'Localisation': b.currentLocation,
      'Statut': b.status,
      'Date Création': b.createdAt ? new Date(b.createdAt).toLocaleDateString('fr-FR') : ''
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bouteilles');
  
  XLSX.writeFile(workbook, `bouteilles_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Clients en PDF
export const exportClientsToPDF = (clients: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Liste des Clients', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  autoTable(doc, {
    startY: 35,
    head: [['Nom', 'Téléphone', 'Adresse', 'Nb Bouteilles']],
    body: clients.map(c => [
      c.name,
      c.phone,
      c.address || 'N/A',
      c.bottlesCount || 0
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.text(`Total: ${clients.length} clients`, 14, finalY + 10);
  
  doc.save(`clients_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Clients en Excel
export const exportClientsToExcel = (clients: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    clients.map(c => ({
      'Nom': c.name,
      'Téléphone': c.phone,
      'Adresse': c.address || '',
      'Nombre de Bouteilles': c.bottlesCount || 0,
      'Date Création': c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : ''
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  
  XLSX.writeFile(workbook, `clients_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Mouvements en PDF
export const exportMovementsToPDF = (movements: any[], bottles: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Historique des Mouvements', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  autoTable(doc, {
    startY: 35,
    head: [['Bouteille', 'De', 'Vers', 'Date', 'Par']],
    body: movements.map(m => {
      const bottle = bottles.find(b => b.id === m.bottleId);
      return [
        bottle?.serialNumber || 'N/A',
        m.fromLocation,
        m.toLocation,
        m.movementDate ? new Date(m.movementDate).toLocaleDateString('fr-FR') : 'N/A',
        m.performedBy
      ];
    }),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.text(`Total: ${movements.length} mouvements`, 14, finalY + 10);
  
  doc.save(`mouvements_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Mouvements en Excel
export const exportMovementsToExcel = (movements: any[], bottles: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    movements.map(m => {
      const bottle = bottles.find(b => b.id === m.bottleId);
      return {
        'Bouteille': bottle?.serialNumber || 'N/A',
        'De': m.fromLocation,
        'Vers': m.toLocation,
        'Date': m.movementDate ? new Date(m.movementDate).toLocaleDateString('fr-FR') : '',
        'Effectué par': m.performedBy,
        'Notes': m.notes || ''
      };
    })
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mouvements');
  
  XLSX.writeFile(workbook, `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Rapport Complet en PDF
export const exportFullReportToPDF = (stats: any, bottles: any[], clients: any[], movements: any[]) => {
  const doc = new jsPDF();
  
  // Page 1 - Statistiques
  doc.setFontSize(20);
  doc.text('Rapport Complet Eluxtan', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 14, 32);
  
  // Statistiques globales
  doc.setFontSize(14);
  doc.text('Statistiques Globales', 14, 45);
  doc.setFontSize(11);
  doc.text(`Total Bouteilles: ${stats.totalBottles}`, 20, 55);
  doc.text(`En Stock: ${stats.enStock} (${Math.round((stats.enStock/stats.totalBottles)*100)}%)`, 20, 62);
  doc.text(`Chez Clients: ${stats.chezClients} (${Math.round((stats.chezClients/stats.totalBottles)*100)}%)`, 20, 69);
  doc.text(`En Transit: ${stats.enCirculation}`, 20, 76);
  doc.text(`Nombre de Clients: ${clients.length}`, 20, 83);
  doc.text(`Nombre de Mouvements: ${movements.length}`, 20, 90);
  
  // Répartition par marque
  const brandCounts: Record<string, number> = {};
  bottles.forEach(b => {
    brandCounts[b.gasBrand] = (brandCounts[b.gasBrand] || 0) + 1;
  });
  
  doc.setFontSize(14);
  doc.text('Répartition par Marque', 14, 105);
  doc.setFontSize(11);
  let yPos = 115;
  Object.entries(brandCounts).forEach(([brand, count]) => {
    doc.text(`${brand}: ${count} bouteilles (${Math.round((count/bottles.length)*100)}%)`, 20, yPos);
    yPos += 7;
  });
  
  // Page 2 - Tableau des bouteilles
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Liste des Bouteilles', 14, 22);
  
  autoTable(doc, {
    startY: 28,
    head: [['N° Série', 'Marque', 'Volume', 'Localisation']],
    body: bottles.slice(0, 30).map(b => [
      b.serialNumber,
      b.gasBrand,
      `${b.gasVolume}L`,
      b.currentLocation
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  doc.save(`rapport_complet_${new Date().toISOString().split('T')[0]}.pdf`);
};
