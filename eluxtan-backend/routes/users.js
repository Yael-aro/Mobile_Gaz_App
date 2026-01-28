const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../config/firebase');

// GET - Récupérer tous les cantiniers
router.get('/cantiniers', async (req, res) => {
  try {
    console.log('📥 GET /api/users/cantiniers');
    
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'cantinier')
      .get();
    
    const cantiniers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${cantiniers.length} cantiniers`);
    res.json(cantiniers);
  } catch (error) {
    console.error('❌ Error fetching cantiniers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer un cantinier spécifique
router.get('/cantinier/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 GET /api/users/cantinier/' + id);
    
    const doc = await db.collection('users').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Cantinier non trouvé' });
    }
    
    const cantinier = {
      id: doc.id,
      ...doc.data()
    };
    
    res.json(cantinier);
  } catch (error) {
    console.error('❌ Error fetching cantinier:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau cantinier
router.post('/create-cantinier', async (req, res) => {
  try {
    const { name, email, password, phone, employeeId } = req.body;

    console.log('📝 POST /api/users/create-cantinier:', { name, email, employeeId });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Créer dans Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name
    });

    console.log('✅ Auth user created:', userRecord.uid);

    // Créer dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: 'cantinier',
      phone: phone || '',
      employeeId: employeeId || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firestore document created');

    res.status(201).json({
      id: userRecord.uid,
      email: email,
      name: name,
      role: 'cantinier',
      message: 'Cantinier créé avec succès'
    });
  } catch (error) {
    console.error('❌ Error creating cantinier:', error);
    
    let errorMessage = 'Erreur lors de la création';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Cet email est déjà utilisé';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// PUT - Mettre à jour un cantinier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, employeeId } = req.body;

    console.log('📝 PUT /api/users/' + id);

    await db.collection('users').doc(id).update({
      name: name,
      phone: phone || '',
      employeeId: employeeId || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Cantinier updated');
    res.json({ message: 'Cantinier updated successfully' });
  } catch (error) {
    console.error('❌ Error updating cantinier:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un cantinier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /api/users/' + id);

    // Supprimer de Firestore
    await db.collection('users').doc(id).delete();

    // Supprimer de Auth
    await auth.deleteUser(id);

    console.log('✅ Cantinier deleted');
    res.json({ message: 'Cantinier deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting cantinier:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
