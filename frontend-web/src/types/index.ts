// Bottle Types
export interface Bottle {
  id: string;
  gasBrand: string;
  serialNumber: string;
  volume: number;
  volumeUnit: 'L' | 'KG';
  bottleType: 'acier' | 'composite' | 'aluminium';
  weight: number;
  bottleBrand: string;
  currentLocation: 'client' | 'warehouse' | 'cantinier';
  locationId?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'lost';
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Movement {
  id: string;
  bottleId: string;
  bottleSerial: string;
  bottleBrand: string;
  from: string;
  to: string;
  fromType: 'client' | 'warehouse' | 'cantinier';
  toType: 'client' | 'warehouse' | 'cantinier';
  clientId?: string;
  clientName?: string;
  movedBy: string;
  movedByName: string;
  timestamp: Date;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cantinier' | 'client';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bottleCount: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'not_returned' | 'anomaly' | 'info';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: Date;
  relatedId?: string;
}

export interface StockStats {
  totalBottles: number;
  available: number;
  inUse: number;
  maintenance: number;
  lost: number;
  atClients: number;
  atWarehouses: number;
  atCantiniers: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity: number;
  currentStock: number;
}

export type BottleTypeLabel = {
  [key in Bottle['bottleType']]: string;
};

export type StatusLabel = {
  [key in Bottle['status']]: string;
};

export type LocationLabel = {
  [key in Bottle['currentLocation']]: string;
};
