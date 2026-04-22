# API Bancaire avec Swagger

Une API REST complète pour les opérations bancaires avec documentation Swagger.

## Fonctionnalités

- ✅ Création de comptes bancaires
- ✅ Consultation des comptes
- ✅ Dépôts sur les comptes
- ✅ Retraits des comptes
- ✅ Historique des transactions
- ✅ Documentation interactive avec Swagger

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

Le serveur démarre sur le port 3000 (ou PORT défini dans les variables d'environnement).

## Documentation API

Une fois le serveur lancé, accédez à la documentation Swagger :

- http://localhost:3000/api-docs
- http://localhost:3000/docs

## Endpoints

### Comptes

- `POST /accounts` - Créer un compte
- `GET /accounts` - Lister tous les comptes
- `GET /accounts/:id` - Obtenir un compte spécifique

### Transactions

- `POST /accounts/:id/deposit` - Faire un dépôt
- `POST /accounts/:id/withdraw` - Faire un retrait
- `GET /accounts/:id/history` - Voir l'historique des transactions

## Déploiement sur Render

1. Connectez-vous à [Render](https://render.com)
2. Créez un nouveau service Web
3. Connectez votre dépôt GitHub
4. Configurez le build et le start command :
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Déployez !

## Technologies utilisées

- Node.js
- Express.js
- Swagger UI pour la documentation
- Git pour le versioning
