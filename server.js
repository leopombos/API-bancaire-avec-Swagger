const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

let accounts = [];
let currentId = 1;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Système de transaction bancaire',
    version: '1.0.0',
    description: 'API REST pour créer des comptes, lister les comptes, faire des dépôts et des retraits'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Serveur local'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./server.js']
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Créer un compte bancaire
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - accountType
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 example: courant
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 */
app.post('/accounts', (req, res) => {
  const { nom, email, accountType } = req.body;

  if (!nom || !email || !accountType) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  const account = {
    id: currentId++,
    nom,
    email,
    accountType,
    solde: 0
  };

  accounts.push(account);
  res.status(201).json(account);
});

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Obtenir la liste des comptes
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Liste des comptes
 */
app.get('/accounts', (req, res) => {
  res.status(200).json(accounts);
});

/**
 * @swagger
 * /accounts/{id}/deposit:
 *   post:
 *     summary: Faire un dépôt
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dépôt effectué
 */
app.post('/accounts/:id/deposit', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;

  const account = accounts.find(acc => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Montant invalide' });
  }

  account.solde += amount;
  res.status(200).json(account);
});

/**
 * @swagger
 * /accounts/{id}/withdraw:
 *   post:
 *     summary: Faire un retrait
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Retrait effectué
 */
app.post('/accounts/:id/withdraw', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;

  const account = accounts.find(acc => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Montant invalide' });
  }

  if (account.solde < amount) {
    return res.status(400).json({ message: 'Solde insuffisant' });
  }

  account.solde -= amount;
  res.status(200).json(account);
});

app.get('/', (req, res) => {
  res.send('API bancaire opérationnelle. Documentation: /api-docs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});