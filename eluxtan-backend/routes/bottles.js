const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// GET toutes les bouteilles
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('bottles').get();
    const bottles = [];
    
    snapshot.forEach(doc => {
      bottles.push({ id: doc.id, ...doc.data() });
    });

    res.json(bottles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET une bouteille par ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('bottles').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Bouteille non trouvée' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer une bouteille
router.post('/', async (req, res) => {
  try {
    const {
      gasBrand,
      serialNumber,
      gasVolume,
      bottleType,
      weight,
      bottleBrand,
      currentLocation,
      locationId
    } = req.body;

    const bottleData = {
      gasBrand,
      serialNumber,
      gasVolume: parseFloat(gasVolume),
      bottleType,
      weight: parseFloat(weight),
      bottleBrand: bottleBrand || gasBrand,
      currentLocation: currentLocation || 'entrepôt',
      locationId: locationId || null,
      status: 'en stock',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('bottles').add(bottleData);

    res.status(201).json({ 
      id: docRef.id, 
      message: 'Bouteille créée avec succès',
      data: bottleData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT mettre à jour une bouteille
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('bottles').doc(req.params.id).update(updateData);

    res.json({ 
      id: req.params.id, 
      message: 'Bouteille mise à jour' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer une bouteille
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('bottles').doc(req.params.id).delete();
    res.json({ message: 'Bouteille supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET statistiques
router.get('/stats/overview', async (req, res) => {
  try {
    const snapshot = await db.collection('bottles').get();
    
    const stats = {
      total: snapshot.size,
      enStock: 0,
      chezClients: 0,
      enCirculation: 0
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.currentLocation === 'entrepôt') stats.enStock++;
      else if (data.currentLocation === 'client') stats.chezClients++;
      else stats.enCirculation++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
