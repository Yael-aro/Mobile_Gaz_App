import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockBottles, mockClients, mockMovements } from '@/data/mockData';
import { convertBottleDates, convertMovementDates } from '@/lib/dateUtils';
import { Bottle, Client, Movement } from '@/types';

interface Stats {
  totalBottles: number;
  enStock: number;
  chezClients: number;
  enCirculation: number;
}

interface BottleContextType {
  updateClient: (id: string, client: any) => Promise<void>;
deleteClient: (id: string) => Promise<void>;
  bottles: Bottle[];
  clients: Client[];
  movements: Movement[];
  stats: Stats;
  loading: boolean;
  error: string | null;
  fetchBottles: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchMovements: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addBottle: (bottle: any) => Promise<void>;
  updateBottle: (id: string, bottle: any) => Promise<void>;
  deleteBottle: (id: string) => Promise<void>;
  addClient: (client: any) => Promise<void>;
  addMovement: (movement: any) => Promise<void>;
}

const BottleContext = createContext<BottleContextType | undefined>(undefined);

const API_URL = 'http://localhost:3001/api';

export const BottleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bottles, setBottles] = useState<Bottle[]>(mockBottles);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [movements, setMovements] = useState<Movement[]>(mockMovements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats: Stats = {
    totalBottles: bottles.length,
    enStock: bottles.filter(b => b.currentLocation === 'entrepôt').length,
    chezClients: bottles.filter(b => b.currentLocation === 'client').length,
    enCirculation: bottles.filter(b => b.currentLocation === 'cantinier').length
  };
  // Cache local pour mode hors ligne
  const loadFromCache = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const saveToCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de sauvegarder dans le cache');
    }
  };

const fetchBottles = async () => {
    try {
      console.log('🔄 Fetching bottles from API...');
      const response = await fetch(`${API_URL}/bottles`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      console.log('✅ Bottles loaded from API:', data.length);
      
      const bottlesWithDates = data.map(convertBottleDates);
      setBottles(bottlesWithDates);
      saveToCache('bottles', bottlesWithDates); // Sauvegarder dans le cache
      setError(null);
    } catch (err) {
      console.warn('⚠️ API not available, using cache or mock data');
      const cached = loadFromCache('bottles');
      setBottles(cached || mockBottles);
    }
  };

  const fetchClients = async () => {
    try {
      console.log('🔄 Fetching clients from API...');
      const response = await fetch(`${API_URL}/clients`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      console.log('✅ Clients loaded from API:', data.length);
      setClients(data);
    } catch (err) {
      console.warn('⚠️ API not available, using mock data');
      setClients(mockClients);
    }
  };

  const fetchMovements = async () => {
    try {
      console.log('🔄 Fetching movements from API...');
      const response = await fetch(`${API_URL}/movements`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      console.log('✅ Movements loaded from API:', data.length);
      
      // Convertit les timestamps Firebase en dates JavaScript
      const movementsWithDates = data.map(convertMovementDates);
      setMovements(movementsWithDates);
    } catch (err) {
      console.warn('⚠️ API not available, using mock data');
      setMovements(mockMovements);
    }
  };

  const fetchStats = async () => {
    // Stats calculés localement pour l'instant
  };

  const addBottle = async (bottle: any) => {
    try {
      console.log('➕ Adding bottle via API...');
      const response = await fetch(`${API_URL}/bottles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bottle)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add bottle');
      }
      
      console.log('✅ Bottle added');
      await fetchBottles(); // Recharge les bouteilles
    } catch (err) {
      console.error('❌ Error adding bottle:', err);
      // Fallback: ajout local
      setBottles([...bottles, { ...bottle, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }]);
    }
  };

  const updateBottle = async (id: string, bottle: any) => {
    try {
      console.log('✏️ Updating bottle via API...');
      const response = await fetch(`${API_URL}/bottles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bottle)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bottle');
      }
      
      console.log('✅ Bottle updated');
      await fetchBottles();
    } catch (err) {
      console.error('❌ Error updating bottle:', err);
      // Fallback: mise à jour locale
      setBottles(bottles.map(b => b.id === id ? { ...b, ...bottle, updatedAt: new Date() } : b));
    }
  };

  const deleteBottle = async (id: string) => {
    try {
      console.log('🗑️ Deleting bottle via API...');
      const response = await fetch(`${API_URL}/bottles/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bottle');
      }
      
      console.log('✅ Bottle deleted');
      await fetchBottles();
    } catch (err) {
      console.error('❌ Error deleting bottle:', err);
      // Fallback: suppression locale
      setBottles(bottles.filter(b => b.id !== id));
    }
  };

  const addClient = async (client: any) => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add client');
      }
      
      await fetchClients();
    } catch (err) {
      console.error('❌ Error adding client:', err);
      setClients([...clients, { ...client, id: Date.now().toString() }]);
    }
  };

const addMovement = async (movementData: any) => {
  try {
    const response = await fetch(`${API_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movementData)
    });

    if (!response.ok) throw new Error('Failed to add movement');

    const newMovement = await response.json();
    
    // Rafraîchir les mouvements
    await fetchMovements();
    
    // Rafraîchir les bouteilles
    await fetchBottles();
    
    // 🆕 RAFRAÎCHIR LES CLIENTS AUSSI!
    await fetchClients();
    
    return newMovement;
  } catch (error) {
    console.error('Error adding movement:', error);
    throw error;
  }
};

  useEffect(() => {
    console.log('🚀 Loading data...');
    fetchBottles();
    fetchClients();
    fetchMovements();
  }, []);

  return (
    <BottleContext.Provider
      value={{
        bottles,
        clients,
        movements,
        stats,
        loading,
        error,
        fetchBottles,
        fetchClients,
        fetchMovements,
        fetchStats,
        addBottle,
        updateBottle,
        deleteBottle,
        addClient,
        addMovement
      }}
    >
      {children}
    </BottleContext.Provider>
  );
};

const updateClient = async (id: string, client: any) => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      await fetchClients();
    } catch (err) {
      console.error('❌ Error updating client:', err);
      setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      await fetchClients();
    } catch (err) {
      console.error('❌ Error deleting client:', err);
      setClients(clients.filter(c => c.id !== id));
    }
  };
export const useBottles = () => {
  const context = useContext(BottleContext);
  if (context === undefined) {
    throw new Error('useBottles must be used within a BottleProvider');
  }
  
  return context;
};
