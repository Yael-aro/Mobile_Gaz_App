const { db, admin } = require('./config/firebase');

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Créer des clients
    console.log('Creating clients...');
    const client1 = await db.collection('clients').add({
      name: 'Restaurant La Paix',
      phone: '0612345678',
      address: 'Casablanca, Maroc',
      bottlesCount: 0,
      activeBottles: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const client2 = await db.collection('clients').add({
      name: 'Café Atlas',
      phone: '0623456789',
      address: 'Rabat, Maroc',
      bottlesCount: 0,
      activeBottles: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const client3 = await db.collection('clients').add({
      name: 'Boulangerie Moderne',
      phone: '0634567890',
      address: 'Settat, Maroc',
      bottlesCount: 0,
      activeBottles: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Clients created');

    // 2. Créer des bouteilles
    console.log('Creating bottles...');
    
    const bottles = [
      {
        gasBrand: 'Afriquia',
        serialNumber: 'AFR-2024-001',
        gasVolume: 13,
        bottleType: 'acier',
        weight: 15.5,
        bottleBrand: 'Afriquia',
        currentLocation: 'entrepôt',
        locationId: null,
        status: 'en stock'
      },
      {
        gasBrand: 'Afriquia',
        serialNumber: 'AFR-2024-002',
        gasVolume: 13,
        bottleType: 'acier',
        weight: 15.5,
        bottleBrand: 'Afriquia',
        currentLocation: 'client',
        locationId: client1.id,
        status: 'en circulation'
      },
      {
        gasBrand: 'Total',
        serialNumber: 'TOT-2024-001',
        gasVolume: 6,
        bottleType: 'composite',
        weight: 8.2,
        bottleBrand: 'Total',
        currentLocation: 'client',
        locationId: client2.id,
        status: 'en circulation'
      },
      {
        gasBrand: 'Butagaz',
        serialNumber: 'BUT-2024-001',
        gasVolume: 13,
        bottleType: 'acier',
        weight: 15.8,
        bottleBrand: 'Butagaz',
        currentLocation: 'entrepôt',
        locationId: null,
        status: 'en stock'
      },
      {
        gasBrand: 'Afriquia',
        serialNumber: 'AFR-2024-003',
        gasVolume: 3,
        bottleType: 'composite',
        weight: 4.5,
        bottleBrand: 'Afriquia',
        currentLocation: 'client',
        locationId: client3.id,
        status: 'en circulation'
      },
      {
        gasBrand: 'Total',
        serialNumber: 'TOT-2024-002',
        gasVolume: 13,
        bottleType: 'acier',
        weight: 15.5,
        bottleBrand: 'Total',
        currentLocation: 'entrepôt',
        locationId: null,
        status: 'en stock'
      },
      {
        gasBrand: 'Butagaz',
        serialNumber: 'BUT-2024-002',
        gasVolume: 6,
        bottleType: 'composite',
        weight: 8.0,
        bottleBrand: 'Butagaz',
        currentLocation: 'cantinier',
        locationId: null,
        status: 'en transit'
      },
      {
        gasBrand: 'Afriquia',
        serialNumber: 'AFR-2024-004',
        gasVolume: 13,
        bottleType: 'acier',
        weight: 15.5,
        bottleBrand: 'Afriquia',
        currentLocation: 'entrepôt',
        locationId: null,
        status: 'en stock'
      }
    ];

    for (const bottle of bottles) {
      await db.collection('bottles').add({
        ...bottle,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log('✅ Bottles created');

    // 3. Créer quelques mouvements
    console.log('Creating movements...');
    
    const bottlesSnapshot = await db.collection('bottles').limit(3).get();
    const bottleIds = [];
    bottlesSnapshot.forEach(doc => bottleIds.push(doc.id));

    if (bottleIds.length > 0) {
      await db.collection('movements').add({
        bottleId: bottleIds[0],
        fromLocation: 'entrepôt',
        toLocation: 'client',
        fromLocationId: null,
        toLocationId: client1.id,
        movementDate: admin.firestore.FieldValue.serverTimestamp(),
        performedBy: 'system',
        notes: 'Livraison initiale'
      });

      await db.collection('movements').add({
        bottleId: bottleIds[1],
        fromLocation: 'entrepôt',
        toLocation: 'cantinier',
        fromLocationId: null,
        toLocationId: null,
        movementDate: admin.firestore.FieldValue.serverTimestamp(),
        performedBy: 'system',
        notes: 'Transfert au cantinier'
      });
    }

    console.log('✅ Movements created');

    // Supprime les documents de test
    const testDocs = await db.collection('bottles').where('test', '==', 'test').get();
    for (const doc of testDocs.docs) {
      await doc.ref.delete();
    }
    console.log('✅ Test documents cleaned');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   - ${bottles.length} bottles`);
    console.log('   - 3 clients');
    console.log('   - 2 movements');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
