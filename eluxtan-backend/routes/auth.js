const express = require('express');
const router = express.Router();
const { admin, db, auth } = require('../config/firebase');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: role || 'client',
      phone: phone || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      uid: userRecord.uid,
      email,
      name,
      role: role || 'client'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:uid', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
