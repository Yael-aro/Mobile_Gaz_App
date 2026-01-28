const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// GET tous les clients
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('clients').get();
    const clients = [];
    
    snapshot.forEach(doc => {
      clients.push({ id: doc.id, ...doc.data() });
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer un client
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const clientData = {
      name,
      phone,
      address: address || '',
      bottlesCount: 0,
      activeBottles: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('clients').add(clientData);

    res.status(201).json({ 
      id: docRef.id, 
      message: 'Client créé avec succès',
      data: clientData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET bouteilles d'un client
router.get('/:id/bottles', async (req, res) => {
  try {
    const snapshot = await db.collection('bottles')
      .where('locationId', '==', req.params.id)
      .where('currentLocation', '==', 'client')
      .get();
    
    const bottles = [];
    snapshot.forEach(doc => {
      bottles.push({ id: doc.id, ...doc.data() });
    });

    res.json(bottles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('clients').doc(req.params.id).update(updateData);

    res.json({ 
      id: req.params.id, 
      message: 'Client mis à jour' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('clients').doc(req.params.id).delete();
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

// GET - Mettre à jour le compteur de bouteilles pour un client
router.get('/:id/update-count', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Compter les bouteilles actives pour ce client
    const bottlesSnapshot = await db.collection('bottles')
      .where('currentLocation', '==', 'client')
      .where('locationId', '==', id)
      .get();
    
    const count = bottlesSnapshot.size;
    const activeBottles = bottlesSnapshot.docs.map(doc => doc.id);
    
    // Mettre à jour le client
    await db.collection('clients').doc(id).update({
      bottlesCount: count,
      activeBottles: activeBottles
    });
    
    res.json({
      clientId: id,
      bottlesCount: count,
      activeBottles: activeBottles
    });
  } catch (error) {
    console.error('Error updating bottle count:', error);
    res.status(500).json({ error: error.message });
  }
});
