// Middleware de validation des données
const validateBottle = (req, res, next) => {
  const { serialNumber, gasBrand, gasVolume, bottleType, weight } = req.body;

  const errors = [];

  if (!serialNumber || serialNumber.trim().length === 0) {
    errors.push('Le numéro de série est requis');
  }

  if (!gasBrand || !['Afriquia', 'Total', 'Butagaz'].includes(gasBrand)) {
    errors.push('Marque invalide');
  }

  if (!gasVolume || ![3, 6, 13, 34].includes(Number(gasVolume))) {
    errors.push('Volume invalide');
  }

  if (!bottleType || !['acier', 'composite'].includes(bottleType)) {
    errors.push('Type de bouteille invalide');
  }

  if (!weight || isNaN(weight) || weight <= 0) {
    errors.push('Poids invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateClient = (req, res, next) => {
  const { name, phone } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Le nom est requis');
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Le téléphone est requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateMovement = (req, res, next) => {
  const { bottleId, fromLocation, toLocation } = req.body;

  const errors = [];

  if (!bottleId) {
    errors.push('ID de bouteille requis');
  }

  if (!fromLocation || !['entrepôt', 'client', 'cantinier'].includes(fromLocation)) {
    errors.push('Localisation source invalide');
  }

  if (!toLocation || !['entrepôt', 'client', 'cantinier'].includes(toLocation)) {
    errors.push('Localisation destination invalide');
  }

  if (fromLocation === toLocation) {
    errors.push('Les localisations doivent être différentes');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateBottle,
  validateClient,
  validateMovement
};
