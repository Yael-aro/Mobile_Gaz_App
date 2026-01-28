import { Bottle, Movement, User, Client, Notification, Warehouse } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@eluxtan.ma',
    name: 'Ahmed Bennani',
    role: 'admin',
    phone: '+212 6 12 34 56 78',
    address: 'Casablanca, Maroc',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    email: 'cantinier@eluxtan.ma',
    name: 'Youssef El Amrani',
    role: 'cantinier',
    phone: '+212 6 23 45 67 89',
    address: 'Rabat, Maroc',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'user-3',
    email: 'client@example.ma',
    name: 'Restaurant Atlas',
    role: 'client',
    phone: '+212 6 34 56 78 90',
    address: 'Marrakech, Maroc',
    createdAt: new Date('2024-03-10'),
  },
];

export const mockClients: Client[] = [
  { id: 'client-1', name: 'Restaurant Atlas', email: 'atlas@email.ma', phone: '+212 6 11 22 33 44', address: 'Rue Mohammed V, Casablanca', bottleCount: 5, createdAt: new Date('2024-01-10') },
  { id: 'client-2', name: 'Café Central', email: 'central@email.ma', phone: '+212 6 22 33 44 55', address: 'Avenue Hassan II, Rabat', bottleCount: 3, createdAt: new Date('2024-01-15') },
  { id: 'client-3', name: 'Hôtel Royal', email: 'royal@email.ma', phone: '+212 6 33 44 55 66', address: 'Place Jemaa el-Fna, Marrakech', bottleCount: 8, createdAt: new Date('2024-02-01') },
  { id: 'client-4', name: 'Boulangerie Moderne', email: 'moderne@email.ma', phone: '+212 6 44 55 66 77', address: 'Boulevard Zerktouni, Casablanca', bottleCount: 2, createdAt: new Date('2024-02-10') },
  { id: 'client-5', name: 'Pizzeria Napoli', email: 'napoli@email.ma', phone: '+212 6 55 66 77 88', address: 'Rue de Paris, Tanger', bottleCount: 4, createdAt: new Date('2024-02-20') },
  { id: 'client-6', name: 'Snack El Baraka', email: 'baraka@email.ma', phone: '+212 6 66 77 88 99', address: 'Avenue Mohammed VI, Fès', bottleCount: 2, createdAt: new Date('2024-03-01') },
  { id: 'client-7', name: 'Restaurant Le Jardin', email: 'jardin@email.ma', phone: '+212 6 77 88 99 00', address: 'Quartier Palmier, Casablanca', bottleCount: 6, createdAt: new Date('2024-03-10') },
  { id: 'client-8', name: 'Café des Arts', email: 'arts@email.ma', phone: '+212 6 88 99 00 11', address: 'Rue Allal Ben Abdellah, Rabat', bottleCount: 1, createdAt: new Date('2024-03-15') },
  { id: 'client-9', name: 'Grill House', email: 'grill@email.ma', phone: '+212 6 99 00 11 22', address: 'Zone Industrielle, Agadir', bottleCount: 7, createdAt: new Date('2024-03-20') },
  { id: 'client-10', name: 'Pâtisserie Délice', email: 'delice@email.ma', phone: '+212 6 00 11 22 33', address: 'Centre Ville, Meknès', bottleCount: 3, createdAt: new Date('2024-04-01') },
];

export const mockWarehouses: Warehouse[] = [
  { id: 'wh-1', name: 'Entrepôt Casablanca', address: 'Zone Industrielle Aïn Sebaâ', capacity: 500, currentStock: 245 },
  { id: 'wh-2', name: 'Entrepôt Rabat', address: 'Zone Industrielle Témara', capacity: 300, currentStock: 156 },
  { id: 'wh-3', name: 'Entrepôt Marrakech', address: 'Zone Industrielle Sidi Ghanem', capacity: 200, currentStock: 89 },
];

const gasBrands = ['Afriquia Gaz', 'TotalEnergies', 'Shell Gas', 'Butagaz', 'Primagaz'];
const bottleBrands = ['Afriquia', 'Atlas', 'Maghreb Gaz', 'Royal Gaz', 'Premium'];

export const mockBottles: Bottle[] = Array.from({ length: 20 }, (_, i) => {
  const statuses: Bottle['status'][] = ['available', 'in-use', 'maintenance', 'lost'];
  const locations: Bottle['currentLocation'][] = ['client', 'warehouse', 'cantinier'];
  const types: Bottle['bottleType'][] = ['acier', 'composite', 'aluminium'];
  const volumes = [3, 6, 12, 13, 35];
  
  const status = statuses[Math.floor(Math.random() * (i < 15 ? 2 : 4))];
  const location = locations[Math.floor(Math.random() * 3)];
  
  return {
    id: `bottle-${i + 1}`,
    gasBrand: gasBrands[Math.floor(Math.random() * gasBrands.length)],
    serialNumber: `BTL-${String(2024001 + i).padStart(7, '0')}`,
    volume: volumes[Math.floor(Math.random() * volumes.length)],
    volumeUnit: 'KG' as const,
    bottleType: types[Math.floor(Math.random() * types.length)],
    weight: 5 + Math.floor(Math.random() * 20),
    bottleBrand: bottleBrands[Math.floor(Math.random() * bottleBrands.length)],
    currentLocation: location,
    locationId: location === 'client' 
      ? mockClients[Math.floor(Math.random() * mockClients.length)].id 
      : location === 'warehouse' 
        ? mockWarehouses[Math.floor(Math.random() * mockWarehouses.length)].id 
        : 'user-2',
    status,
    qrCode: `QR-${2024001 + i}`,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    updatedAt: new Date(),
  };
});

export const mockMovements: Movement[] = Array.from({ length: 30 }, (_, i) => {
  const bottle = mockBottles[Math.floor(Math.random() * mockBottles.length)];
  const fromTypes: Movement['fromType'][] = ['warehouse', 'client', 'cantinier'];
  const toTypes: Movement['toType'][] = ['client', 'warehouse', 'cantinier'];
  const fromType = fromTypes[Math.floor(Math.random() * fromTypes.length)];
  const toType = toTypes[Math.floor(Math.random() * toTypes.length)];
  
  const getLocationName = (type: string) => {
    if (type === 'client') return mockClients[Math.floor(Math.random() * mockClients.length)].name;
    if (type === 'warehouse') return mockWarehouses[Math.floor(Math.random() * mockWarehouses.length)].name;
    return 'Cantinier Youssef';
  };
  
  return {
    id: `mov-${i + 1}`,
    bottleId: bottle.id,
    bottleSerial: bottle.serialNumber,
    bottleBrand: bottle.gasBrand,
    from: getLocationName(fromType),
    to: getLocationName(toType),
    fromType,
    toType,
    clientId: toType === 'client' ? mockClients[Math.floor(Math.random() * mockClients.length)].id : undefined,
    clientName: toType === 'client' ? mockClients[Math.floor(Math.random() * mockClients.length)].name : undefined,
    movedBy: mockUsers[Math.floor(Math.random() * 2)].id,
    movedByName: mockUsers[Math.floor(Math.random() * 2)].name,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    notes: i % 3 === 0 ? 'Livraison urgente' : undefined,
  };
}).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'not_returned',
    title: 'Bouteille non retournée',
    message: 'Bouteille BTL-2024005 non retournée depuis 30 jours par Restaurant Atlas',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    relatedId: 'bottle-5',
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Stock faible',
    message: 'Attention: Stock faible de bouteilles acier à l\'entrepôt Casablanca',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'notif-3',
    type: 'anomaly',
    title: 'Anomalie détectée',
    message: 'Incohérence détectée: Bouteille BTL-2024012 introuvable lors de l\'inventaire',
    priority: 'high',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    relatedId: 'bottle-12',
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'Nouveau client',
    message: 'Le client "Café des Arts" a été ajouté au système',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: 'notif-5',
    type: 'not_returned',
    title: 'Rappel de retour',
    message: 'Bouteille BTL-2024008 chez Hôtel Royal depuis 25 jours',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    relatedId: 'bottle-8',
  },
];

export const getStockStats = (): { totalBottles: number; available: number; inUse: number; maintenance: number; lost: number; atClients: number; atWarehouses: number; atCantiniers: number } => {
  return {
    totalBottles: mockBottles.length,
    available: mockBottles.filter(b => b.status === 'available').length,
    inUse: mockBottles.filter(b => b.status === 'in-use').length,
    maintenance: mockBottles.filter(b => b.status === 'maintenance').length,
    lost: mockBottles.filter(b => b.status === 'lost').length,
    atClients: mockBottles.filter(b => b.currentLocation === 'client').length,
    atWarehouses: mockBottles.filter(b => b.currentLocation === 'warehouse').length,
    atCantiniers: mockBottles.filter(b => b.currentLocation === 'cantinier').length,
  };
};
