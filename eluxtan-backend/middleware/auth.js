const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(403).json({ error: 'Utilisateur non trouvé' });
      }

      const userRole = userDoc.data().role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = { verifyToken, checkRole };