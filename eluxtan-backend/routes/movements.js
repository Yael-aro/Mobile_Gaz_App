const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// GET - Récupérer tous les mouvements
router.get('/', async (req, res) => {
  try {
    const movementsSnapshot = await db.collection('movements')
      .orderBy('movementDate', 'desc')
      .get();
    
    const movements = movementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      movementDate: doc.data().movementDate?.toDate?.() || doc.data().movementDate
    }));
    
    res.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau mouvement
router.post('/', async (req, res) => {
  try {
    const { bottleId, fromLocation, toLocation, toLocationId, performedBy, notes } = req.body;

    console.log('📦 Creating movement:', {
      bottleId,
      fromLocation,
      toLocation,
      toLocationId: toLocationId || 'null'
    });

    // Validation
    if (!bottleId || !fromLocation || !toLocation) {
      return res.status(400).json({ 
        error: 'Bottle ID, from location, and to location are required' 
      });
    }

    if (toLocation === 'client' && !toLocationId) {
      return res.status(400).json({ 
        error: 'Client ID is required when moving to client' 
      });
    }

    // Créer le mouvement
    const movementData = {
      bottleId,
      fromLocation,
      toLocation,
      toLocationId: toLocationId || null,
      performedBy: performedBy || 'Unknown',
      notes: notes || '',
      movementDate: admin.firestore.FieldValue.serverTimestamp()
    };

    const movementRef = await db.collection('movements').add(movementData);

    // Mettre à jour la bouteille
    await db.collection('bottles').doc(bottleId).update({
      currentLocation: toLocation,
      locationId: toLocationId || null,
      status: toLocation === 'entrepôt' ? 'en stock' : 
              toLocation === 'client' ? 'en circulation' : 'en transit',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Bottle updated:', bottleId, '→', toLocation);

    // Mettre à jour les compteurs des clients
    if (toLocation === 'client' && toLocationId) {
      await updateClientBottleCount(toLocationId);
    }

    if (fromLocation === 'client' && toLocationId) {
      await updateClientBottleCount(toLocationId);
    }

    res.status(201).json({
      id: movementRef.id,
      ...movementData
    });
  } catch (error) {
    console.error('Error creating movement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fonction pour mettre à jour le compteur de bouteilles d'un client
async function updateClientBottleCount(clientId) {
  try {
    console.log('🔄 Updating bottle count for client:', clientId);

    // Compter les bouteilles actives pour ce client (en utilisant clientId comme locationId)
    const bottlesSnapshot = await db.collection('bottles')
      .where('currentLocation', '==', 'client')
      .where('locationId', '==', clientId)
      .get();
    
    const count = bottlesSnapshot.size;
    const activeBottles = bottlesSnapshot.docs.map(doc => doc.id);
    
    console.log(`  Found ${count} bottles for client ${clientId}`);
    
    // Mettre à jour le client
    await db.collection('clients').doc(clientId).update({
      bottlesCount: count,
      activeBottles: activeBottles
    });

    console.log(`✅ Client ${clientId} updated: ${count} bottles`);
  } catch (error) {
    console.error('Error updating client bottle count:', error);
  }
}

module.exports = router;
