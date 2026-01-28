const API_URL = 'http://localhost:3001/api';

// Bottles API
export const bottlesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/bottles`);
    if (!response.ok) throw new Error('Failed to fetch bottles');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/bottles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch bottle');
    return response.json();
  },

  create: async (bottleData: any) => {
    const response = await fetch(`${API_URL}/bottles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bottleData)
    });
    if (!response.ok) throw new Error('Failed to create bottle');
    return response.json();
  },

  update: async (id: string, bottleData: any) => {
    const response = await fetch(`${API_URL}/bottles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bottleData)
    });
    if (!response.ok) throw new Error('Failed to update bottle');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/bottles/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete bottle');
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/bottles/stats/overview`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/clients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json();
  },

  create: async (clientData: any) => {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
  },

  getBottles: async (clientId: string) => {
    const response = await fetch(`${API_URL}/clients/${clientId}/bottles`);
    if (!response.ok) throw new Error('Failed to fetch client bottles');
    return response.json();
  }
};

// Movements API
export const movementsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/movements`);
    if (!response.ok) throw new Error('Failed to fetch movements');
    return response.json();
  },

  create: async (movementData: any) => {
    const response = await fetch(`${API_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movementData)
    });
    if (!response.ok) throw new Error('Failed to create movement');
    return response.json();
  }
};

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
  },

  getProfile: async (uid: string) => {
    const response = await fetch(`${API_URL}/auth/profile/${uid}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }
};
