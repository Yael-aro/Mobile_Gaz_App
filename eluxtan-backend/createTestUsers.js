const { auth, db, admin } = require('./config/firebase');

async function createTestUsers() {
  console.log('👥 Création des utilisateurs de test...');

  const users = [
    {
      email: 'admin@eluxtan.com',
      password: 'Admin123!',
      name: 'Administrateur Eluxtan',
      role: 'admin',
      phone: '0612345678'
    },
    {
      email: 'cantinier@eluxtan.com',
      password: 'Cantinier123!',
      name: 'Cantinier Principal',
      role: 'cantinier',
      phone: '0623456789'
    },
    {
      email: 'client@test.com',
      password: 'Client123!',
      name: 'Client Test',
      role: 'client',
      phone: '0634567890'
    }
  ];

  try {
    for (const userData of users) {
      try {
        // Crée l'utilisateur dans Firebase Auth
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name
        });

        // Ajoute les infos dans Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  Utilisateur existe déjà: ${userData.email}`);
        } else {
          console.error(`❌ Erreur pour ${userData.email}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Utilisateurs de test créés!');
    console.log('\n📋 Identifiants:');
    console.log('Admin:     admin@eluxtan.com / Admin123!');
    console.log('Cantinier: cantinier@eluxtan.com / Cantinier123!');
    console.log('Client:    client@test.com / Client123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUsers();
