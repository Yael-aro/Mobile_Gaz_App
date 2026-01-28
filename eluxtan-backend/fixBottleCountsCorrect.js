const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixBottleCountsCorrect() {
  try {
    console.log('🔧 Fixing bottle counts (CORRECT METHOD)...\n');
    
    // Récupérer TOUS les clients
    const clientsSnapshot = await db.collection('clients').get();
    
    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      
      console.log(`\n📊 ${clientData.name} (${clientId}):`);
      
      // Compter les bouteilles avec locationId = clientId (ID du document)
      const bottlesSnapshot = await db.collection('bottles')
        .where('currentLocation', '==', 'client')
        .where('locationId', '==', clientId)
        .get();
      
      const count = bottlesSnapshot.size;
      const activeBottles = bottlesSnapshot.docs.map(doc => ({
        id: doc.id,
        serial: doc.data().serialNumber
      }));
      
      console.log(`  Found ${count} bottles:`);
      activeBottles.forEach(b => console.log(`    - ${b.serial} (${b.id})`));
      
      // Mettre à jour le client
      await clientDoc.ref.update({
        bottlesCount: count,
        activeBottles: activeBottles.map(b => b.id)
      });
      
      console.log(`  ✅ Updated: ${count} bouteilles`);
    }
    
    console.log('\n✅ Done! All counts updated correctly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBottleCountsCorrect();
