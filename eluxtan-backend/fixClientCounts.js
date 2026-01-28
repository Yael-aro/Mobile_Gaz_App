const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixClientBottleCounts() {
  try {
    console.log('🔧 Fixing client bottle counts...');
    
    // Récupérer tous les clients
    const clientsSnapshot = await db.collection('clients').get();
    
    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      const userId = clientData.userId;
      
      if (!userId) {
        console.log(`⚠️ Client ${clientData.name} has no userId, skipping...`);
        continue;
      }
      
      // Compter les bouteilles actives pour ce client
      const bottlesSnapshot = await db.collection('bottles')
        .where('currentLocation', '==', 'client')
        .where('locationId', '==', userId)
        .get();
      
      const count = bottlesSnapshot.size;
      const activeBottles = bottlesSnapshot.docs.map(doc => doc.id);
      
      // Mettre à jour le client
      await db.collection('clients').doc(clientId).update({
        bottlesCount: count,
        activeBottles: activeBottles
      });
      
      console.log(`✅ ${clientData.name}: ${count} bouteilles`);
    }
    
    console.log('✅ Done! All client counts updated.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixClientBottleCounts();
