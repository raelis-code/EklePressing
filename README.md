# Eklé Clean — FullStack Dynamic + Administration

Application de pressing avec frontend React/Vite et backend Node.js/Express.

## Fonctionnalités

### Site client
- Présentation Eklé Clean
- Forfaits chargés depuis l'API
- Aucun forfait sélectionné automatiquement
- Création de commandes
- Suivi d'une commande par numéro
- Formulaire de contact
- WhatsApp / téléphone

### Administration
- Bouton **Connexion Admin** sur le site
- Authentification administrateur
- Dashboard avec statistiques
- Gestion des commandes et des statuts
- Gestion des forfaits : ajouter, modifier, supprimer
- Gestion des clients
- Lecture des messages clients
- Actualisation des données
- Déconnexion

## Identifiants de démonstration

- Email : `admin@ekleclean.cm`
- Mot de passe : `admin123`

## Démarrage recommandé

À la racine du projet :

```bash
npm run install-all
npm run dev
```

Si les dépendances sont déjà installées, `npm run dev` suffit.

### Démarrage séparé

Terminal 1 :

```bash
npm run dev --prefix backend
```

Terminal 2 :

```bash
npm run dev --prefix frontend
```

Frontend : http://localhost:5173  
Backend : http://localhost:5000  
Health check : http://localhost:5000/api/health

## Données

Le backend sauvegarde les forfaits, commandes et messages dans `backend/data.json`. Les données restent donc disponibles après un redémarrage du serveur.

## Important

Pour un vrai déploiement, remplacez les identifiants de démonstration par des secrets d'environnement et utilisez une vraie base de données ainsi qu'un système de hash de mots de passe/JWT.

## Comptes clients et historique des commandes

La nouvelle version ajoute des comptes clients persistants.

### Client
- Création de compte avec prénom, nom, téléphone, email et mot de passe.
- Connexion avec email et mot de passe.
- Une commande ne peut être passée que depuis un compte client connecté.
- Chaque commande reçoit un numéro unique `EKL-AAAA-XXXXXX`.
- Les commandes sont enregistrées dans `backend/data.json` et ne sont pas supprimées au redémarrage du serveur.
- Dans l'espace client, toutes les commandes historiques sont affichées, même celles des jours précédents.
- Cliquer sur une commande ouvre son détail et sa progression : Commande reçue → Collecte → Lavage → Repassage → Prête → Livrée.
- Les anciennes commandes qui ont le même numéro de téléphone qu'un compte nouvellement créé sont automatiquement rattachées à ce compte lors de la consultation de l'historique.

### API client
- `POST /api/client/register`
- `POST /api/client/login`
- `GET /api/client/me`
- `POST /api/client/logout`
- `GET /api/client/orders`
- `POST /api/orders` (connexion client obligatoire)


## Client account troubleshooting
If registration shows `Unexpected end of JSON input`, make sure only one backend is running and start it from the project root with `npm run dev`. The backend now uses a Windows-safe data-file write and the frontend reports a clear error when the API returns an empty response.
