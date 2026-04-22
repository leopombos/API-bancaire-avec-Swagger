const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

let accounts = [];
let currentId = 1;

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Système de transaction bancaire",
    version: "1.0.0",
    description:
      "API REST pour créer des comptes, lister les comptes, faire des dépôts et des retraits",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Serveur local",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
app.post("/accounts", (req, res) => {
  const { nom, email, accountType } = req.body;

  if (!nom || !email || !accountType) {
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires" });
  }

  const account = {
    id: currentId++,
    nom,
    email,
    accountType,
    solde: 0,
    history: [],
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
app.get("/accounts", (req, res) => {
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
app.post("/accounts/:id/deposit", (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;

  const account = accounts.find((acc) => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: "Compte non trouvé" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Montant invalide" });
  }

  account.solde += amount;
  account.history.push({
    type: "deposit",
    amount,
    date: new Date().toISOString(),
  });

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
/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Obtenir un compte par son ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compte trouvé
 *       404:
 *         description: Compte non trouvé
 */
app.get("/accounts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const account = accounts.find((acc) => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: "Compte non trouvé" });
  }

  res.status(200).json(account);
});

/**
 * @swagger
 * /accounts/{id}/history:
 *   get:
 *     summary: Obtenir l'historique des transactions d'un compte
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historique récupéré
 *       404:
 *         description: Compte non trouvé
 */
app.get("/accounts/:id/history", (req, res) => {
  const id = parseInt(req.params.id);
  const account = accounts.find((acc) => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: "Compte non trouvé" });
  }

  res.status(200).json(account.history);
});

app.post("/accounts/:id/withdraw", (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;

  const account = accounts.find((acc) => acc.id === id);

  if (!account) {
    return res.status(404).json({ message: "Compte non trouvé" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Montant invalide" });
  }

  if (account.solde < amount) {
    return res.status(400).json({ message: "Solde insuffisant" });
  }

  account.solde -= amount;
  account.history.push({
    type: "withdraw",
    amount,
    date: new Date().toISOString(),
  });

  res.status(200).json(account);
});

app.get("/", (req, res) => {
  res.send("API bancaire opérationnelle. Documentation: /api-docs ou /docs");
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`Swagger UI alias: http://localhost:${PORT}/docs`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const altPort = PORT + 1;
    console.warn(
      `Port ${PORT} déjà utilisé. Tentative sur le port ${altPort}...`,
    );
    app.listen(altPort, () => {
      console.log(`Serveur lancé sur le port ${altPort}`);
      console.log(`Swagger UI: http://localhost:${altPort}/api-docs`);
      console.log(`Swagger UI alias: http://localhost:${altPort}/docs`);
    });
  } else {
    console.error(error);
    process.exit(1);
  }
});
