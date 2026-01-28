const { auth, db } = require('./config/firebase');

console.log('🗑️  NETTOYAGE COMPLET DE LA BASE DE DONNÉES');
console.log('='.repeat(60));
console.log('⚠️  ATTENTION: Cette action est IRRÉVERSIBLE!');
console.log('='.repeat(60));

async function deleteCollection(collectionName) {
  console.log(`\n🗑️  Suppression de la collection: ${collectionName}`);
  
  const snapshot = await db.collection(collectionName).get();
  const batchSize = snapshot.size;
  
  if (batchSize === 0) {
    console.log(`   ℹ️  Collection ${collectionName} est déjà vide`);
    return;
  }

  console.log(`   📊 ${batchSize} documents trouvés`);

  // Supprimer par batch de 500 (limite Firestore)
  const batches = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;

    if (count === 500) {
      batches.push(batch.commit());
      batch = db.batch();
      count = 0;
    }
  });

  if (count > 0) {
    batches.push(batch.commit());
  }

  await Promise.all(batches);
  console.log(`   ✅ ${batchSize} documents supprimés`);
}

async function deleteAuthUsers() {
  console.log('\n🗑️  Suppression des utilisateurs Firebase Auth');
  
  try {
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('   ℹ️  Aucun utilisateur à supprimer');
      return;
    }

    console.log(`   📊 ${users.length} utilisateurs trouvés`);

    // Garder l'admin
    const adminEmail = 'admin@eluxtan.com';
    let adminUid = null;
    
    for (const user of users) {
      if (user.email === adminEmail) {
        adminUid = user.uid;
        console.log(`   ⚠️  Conservation de l'admin: ${adminEmail}`);
        continue;
      }

      try {
        await auth.deleteUser(user.uid);
        console.log(`   ✅ Supprimé: ${user.email || user.uid}`);
      } catch (error) {
        console.log(`   ❌ Erreur: ${user.email || user.uid}`);
      }
    }

    // Nettoyer aussi le document Firestore de l'admin si nécessaire
    if (adminUid) {
      const adminDoc = await db.collection('users').doc(adminUid).get();
      if (!adminDoc.exists) {
        await db.collection('users').doc(adminUid).set({
          email: adminEmail,
          name: 'Administrateur',
          role: 'admin',
          createdAt: new Date()
        });
        console.log(`   ✅ Document admin recréé dans Firestore`);
      }
    }

    console.log(`   ✅ Utilisateurs supprimés (sauf admin)`);
  } catch (error) {
    console.error('   ❌ Erreur lors de la suppression des utilisateurs:', error.message);
  }
}

async function resetDatabase() {
  try {
    // 1. Supprimer les collections Firestore
    await deleteCollection('bottles');
    await deleteCollection('clients');
    await deleteCollection('movements');
    
    // 2. Supprimer les utilisateurs (sauf admin)
    const usersSnapshot = await db.collection('users').where('role', '!=', 'admin').get();
    console.log(`\n🗑️  Suppression des utilisateurs Firestore (${usersSnapshot.size} documents)`);
    
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('   ✅ Utilisateurs Firestore supprimés (sauf admin)');
    
    // 3. Supprimer de Firebase Auth
    await deleteAuthUsers();

    console.log('\n' + '='.repeat(60));
    console.log('✅ BASE DE DONNÉES NETTOYÉE AVEC SUCCÈS!');
    console.log('='.repeat(60));
    console.log('\n📋 ÉTAT FINAL:');
    console.log('   - Bouteilles: 0');
    console.log('   - Clients: 0');
    console.log('   - Mouvements: 0');
    console.log('   - Cantiniers: 0');
    console.log('   - Admin: ✅ Conservé (admin@eluxtan.com)\n');
    
    console.log('🎯 PRÊT POUR LES TESTS!\n');
    console.log('Tu peux maintenant:');
    console.log('1. Te connecter en admin (admin@eluxtan.com / Admin123!)');
    console.log('2. Créer des cantiniers dans "Cantiniers"');
    console.log('3. Créer des clients dans "Clients"');
    console.log('4. Créer des bouteilles dans "Bouteilles"');
    console.log('5. Créer des mouvements dans "Mouvements"\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
  }

  process.exit(0);
}

// Confirmation
console.log('\n⏳ Démarrage dans 3 secondes...');
console.log('   Appuie sur Ctrl+C pour annuler\n');

setTimeout(() => {
  resetDatabase();
}, 3000);
