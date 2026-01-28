require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
const bottlesRoutes = require('./routes/bottles');
const clientsRoutes = require('./routes/clients');
const movementsRoutes = require('./routes/movements');
const invitationsRoutes = require('./routes/invitations');
const usersRoutes = require('./routes/users');

app.use('/api/bottles', bottlesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/movements', movementsRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/users', usersRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Eluxtan Backend API' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Server is ready to accept connections');
});

module.exports = app;
