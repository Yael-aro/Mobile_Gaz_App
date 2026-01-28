// Convertit un timestamp Firebase en Date JavaScript
export function convertFirebaseTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  
  // Si c'est déjà une Date
  if (timestamp instanceof Date) return timestamp;
  
  // Si c'est un timestamp Firebase avec _seconds
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // Si c'est un timestamp Firestore standard
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Si c'est une string ou un number
  return new Date(timestamp);
}

// Convertit une bouteille Firebase en bouteille avec dates valides
export function convertBottleDates(bottle: any) {
  return {
    ...bottle,
    createdAt: bottle.createdAt ? convertFirebaseTimestamp(bottle.createdAt) : new Date(),
    updatedAt: bottle.updatedAt ? convertFirebaseTimestamp(bottle.updatedAt) : new Date()
  };
}

// Convertit un mouvement Firebase en mouvement avec dates valides
export function convertMovementDates(movement: any) {
  return {
    ...movement,
    movementDate: movement.movementDate ? convertFirebaseTimestamp(movement.movementDate) : new Date()
  };
}
