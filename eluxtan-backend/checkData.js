const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
  try {
    console.log('\n📋 === CLIENTS ===');
    const clientsSnapshot = await db.collection('clients').get();
    
    for (const doc of clientsSnapshot.docs) {
      const data = doc.data();
      console.log(`\nClient ID: ${doc.id}`);
      console.log(`  Nom: ${data.name}`);
      console.log(`  User ID: ${data.userId || 'MANQUANT!'}`);
      console.log(`  Bouteilles affichées: ${data.bottlesCount || 0}`);
    }
    
    console.log('\n\n📦 === BOUTEILLES CHEZ CLIENTS ===');
    const bottlesSnapshot = await db.collection('bottles')
      .where('currentLocation', '==', 'client')
      .get();
    
    for (const doc of bottlesSnapshot.docs) {
      const data = doc.data();
      console.log(`\nBouteille: ${data.serialNumber}`);
      console.log(`  Location ID: ${data.locationId || 'MANQUANT!'}`);
      console.log(`  Status: ${data.status}`);
    }
    
    console.log('\n\n👤 === USERS (Firebase Auth) ===');
    const usersSnapshot = await db.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      if (data.role === 'client') {
        console.log(`\nUser ID: ${doc.id}`);
        console.log(`  Nom: ${data.name}`);
        console.log(`  Email: ${data.email}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
