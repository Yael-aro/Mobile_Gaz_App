const { db, admin } = require('./config/firebase');

async function generateMoreData() {
  console.log('🌱 Génération de données supplémentaires...');

  try {
    // 1. Générer 50 bouteilles supplémentaires
    console.log('Creating 50 more bottles...');
    const brands = ['Afriquia', 'Total', 'Butagaz'];
    const types = ['acier', 'composite'];
    const volumes = [3, 6, 13, 34];
    const locations = ['entrepôt', 'client', 'cantinier'];
    
    const bottlesPromises = [];
    for (let i = 9; i <= 58; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const volume = volumes[Math.floor(Math.random() * volumes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      const weight = type === 'acier' 
        ? (volume === 3 ? 4.5 : volume === 6 ? 8.2 : volume === 13 ? 15.5 : 30)
        : (volume === 3 ? 3.5 : volume === 6 ? 7.0 : volume === 13 ? 14.0 : 27);

      const bottleData = {
        gasBrand: brand,
        serialNumber: `${brand.substring(0, 3).toUpperCase()}-2024-${String(i).padStart(3, '0')}`,
        gasVolume: volume,
        bottleType: type,
        weight: weight,
        bottleBrand: brand,
        currentLocation: location,
        locationId: null,
        status: location === 'entrepôt' ? 'en stock' : location === 'client' ? 'en circulation' : 'en transit',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      bottlesPromises.push(db.collection('bottles').add(bottleData));
    }

    await Promise.all(bottlesPromises);
    console.log('✅ 50 bouteilles créées');

    // 2. Générer 20 clients supplémentaires
    console.log('Creating 20 more clients...');
    const clientTypes = [
      'Restaurant', 'Café', 'Boulangerie', 'Pâtisserie', 
      'Hôtel', 'Supermarché', 'Épicerie', 'Pizzeria'
    ];
    const cities = [
      'Casablanca', 'Rabat', 'Marrakech', 'Fès', 
      'Tanger', 'Agadir', 'Meknès', 'Settat'
    ];

    const clientsPromises = [];
    for (let i = 5; i <= 24; i++) {
      const type = clientTypes[Math.floor(Math.random() * clientTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      const clientData = {
        name: `${type} ${city} ${i}`,
        phone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `${Math.floor(Math.random() * 200)} Rue ${i}, ${city}, Maroc`,
        bottlesCount: Math.floor(Math.random() * 5),
        activeBottles: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      clientsPromises.push(db.collection('clients').add(clientData));
    }

    await Promise.all(clientsPromises);
    console.log('✅ 20 clients créés');

    // 3. Générer 30 mouvements
    console.log('Creating 30 movements...');
    const bottlesSnapshot = await db.collection('bottles').limit(30).get();
    const bottleIds = bottlesSnapshot.docs.map(doc => doc.id);

    const movementsPromises = [];
    for (let i = 0; i < 30; i++) {
      const bottleId = bottleIds[i];
      const fromLocations = ['entrepôt', 'client', 'cantinier'];
      const toLocations = ['entrepôt', 'client', 'cantinier'];
      
      const fromLocation = fromLocations[Math.floor(Math.random() * fromLocations.length)];
      let toLocation = toLocations[Math.floor(Math.random() * toLocations.length)];
      while (toLocation === fromLocation) {
        toLocation = toLocations[Math.floor(Math.random() * toLocations.length)];
      }

      const movementData = {
        bottleId: bottleId,
        fromLocation: fromLocation,
        toLocation: toLocation,
        fromLocationId: null,
        toLocationId: null,
        movementDate: admin.firestore.FieldValue.serverTimestamp(),
        performedBy: 'system',
        notes: `Transfert automatique ${i + 1}`
      };

      movementsPromises.push(db.collection('movements').add(movementData));
    }

    await Promise.all(movementsPromises);
    console.log('✅ 30 mouvements créés');

    console.log('\n🎉 Données générées avec succès!');
    console.log('   - 50 bouteilles supplémentaires (Total: 58)');
    console.log('   - 20 clients supplémentaires (Total: 24)');
    console.log('   - 30 mouvements supplémentaires (Total: 32)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

generateMoreData();
