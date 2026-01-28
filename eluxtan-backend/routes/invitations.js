const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../config/firebase');
const { sendClientInvitation } = require('../services/emailService');

// Générer un mot de passe temporaire aléatoire
function generateTempPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// POST - Créer un client et envoyer invitation
router.post('/invite-client', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Vérifier si l'email existe déjà
    try {
      await auth.getUserByEmail(email);
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    } catch (error) {
      // L'utilisateur n'existe pas, on continue
    }

    // Générer un mot de passe temporaire
    const tempPassword = generateTempPassword();

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: tempPassword,
      displayName: name,
      emailVerified: false
    });

    // Créer le document utilisateur dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: 'client',
      phone: phone || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      accountStatus: 'pending', // En attente de confirmation
      passwordChanged: false
    });

    // Créer le document client dans Firestore
    const clientRef = await db.collection('clients').add({
      userId: userRecord.uid,
      name: name,
      phone: phone || '',
      address: address || '',
      bottlesCount: 0,
      activeBottles: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Générer le lien de réinitialisation de mot de passe
    const resetLink = await auth.generatePasswordResetLink(email);

    // Envoyer l'email d'invitation
    const emailResult = await sendClientInvitation({
      email: email,
      name: name,
      tempPassword: tempPassword,
      resetLink: resetLink
    });

    if (!emailResult.success) {
      console.error('Email non envoyé, mais compte créé');
    }

    res.status(201).json({
      message: 'Client créé et invitation envoyée',
      userId: userRecord.uid,
      clientId: clientRef.id,
      emailSent: emailResult.success,
      tempPassword: tempPassword // Retourner aussi pour l'admin (au cas où)
    });

  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la création du client' 
    });
  }
});

// POST - Renvoyer l'invitation
router.post('/resend-invitation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer l'utilisateur
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userData = userDoc.data();

    // Générer nouveau lien de réinitialisation
    const resetLink = await auth.generatePasswordResetLink(userData.email);

    // Renvoyer l'email
    const emailResult = await sendClientInvitation({
      email: userData.email,
      name: userData.name,
      tempPassword: '(Voir email précédent)',
      resetLink: resetLink
    });

    res.json({
      message: 'Invitation renvoyée',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Erreur renvoi invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
