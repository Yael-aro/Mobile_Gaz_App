const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixBottleCounts() {
  try {
    console.log('🔧 Fixing bottle counts intelligently...\n');
    
    // 1. Récupérer tous les users de type client
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'client')
      .get();
    
    const userIds = new Map();
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      userIds.set(doc.id, data.name);
    });
    
    console.log(`Found ${userIds.size} client users\n`);
    
    // 2. Pour chaque user, compter ses bouteilles
    for (const [userId, userName] of userIds) {
      console.log(`\n📊 Checking ${userName} (${userId}):`);
      
      // Compter les bouteilles avec locationId = userId
      const bottlesSnapshot = await db.collection('bottles')
        .where('currentLocation', '==', 'client')
        .where('locationId', '==', userId)
        .get();
      
      const count = bottlesSnapshot.size;
      const activeBottles = bottlesSnapshot.docs.map(doc => ({
        id: doc.id,
        serial: doc.data().serialNumber
      }));
      
      console.log(`  Found ${count} bottles:`);
      activeBottles.forEach(b => console.log(`    - ${b.serial}`));
      
      // Trouver le document client correspondant
      const clientsSnapshot = await db.collection('clients')
        .where('userId', '==', userId)
        .get();
      
      if (clientsSnapshot.empty) {
        console.log(`  ⚠️ No client document found! Creating one...`);
        
        // Créer le document client
        await db.collection('clients').add({
          userId: userId,
          name: userName,
          phone: '',
          address: '',
          bottlesCount: count,
          activeBottles: activeBottles.map(b => b.id),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`  ✅ Created client document`);
      } else {
        // Mettre à jour le document client existant
        const clientDoc = clientsSnapshot.docs[0];
        await clientDoc.ref.update({
          bottlesCount: count,
          activeBottles: activeBottles.map(b => b.id),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`  ✅ Updated client document (${clientDoc.id})`);
      }
    }
    
    // 3. Nettoyer les clients sans userId
    console.log('\n\n🧹 Cleaning up clients without userId...');
    const allClientsSnapshot = await db.collection('clients').get();
    
    for (const doc of allClientsSnapshot.docs) {
      const data = doc.data();
      if (!data.userId) {
        console.log(`  ⚠️ Client "${data.name}" (${doc.id}) has no userId`);
        console.log(`     Bouteilles affichées: ${data.bottlesCount || 0}`);
        // Tu peux choisir de les supprimer ou de les garder
      }
    }
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBottleCounts();
