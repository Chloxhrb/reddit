# Projet Reddit Clone

Ce projet est un clone simplifié de Reddit, une plateforme de réseau social axée sur le partage de contenu. Il permet aux utilisateurs de créer des comptes, de publier des messages et des commentaires, ainsi que de créer et de modérer des sous-communautés (subreddits).

## Technologies Utilisées

- **Node.js**: Utilisé pour exécuter le serveur backend de l'application.
- **Express.js**: Un framework web pour Node.js, utilisé pour créer des routes et gérer les requêtes HTTP.
- **MongoDB**: Une base de données NoSQL utilisée pour stocker les données des utilisateurs, des posts, des commentaires et des sous-communautés.
- **Mongoose**: Une bibliothèque Node.js qui fournit une couche de modélisation MongoDB pour simplifier l'interaction avec la base de données MongoDB.
- **Bcrypt**: Une bibliothèque de hachage de mots de passe utilisée pour sécuriser les mots de passe des utilisateurs.
- **JSON Web Tokens (JWT)**: Utilisé pour la gestion de l'authentification des utilisateurs.
- **Body-parser**: Un middleware pour Express.js utilisé pour analyser les corps des requêtes HTTP.

## Structure du Projet

Le projet est structuré dans un seul fichier, `reddit.js`, qui contient l'ensemble de la logique de l'application, y compris la configuration du serveur Express, la définition des schémas de données avec Mongoose, la définition des routes et des middlewares.

## Comment Contribuer

Les contributions à ce projet sont les bienvenues! Voici comment vous pouvez contribuer :

1. Fork le projet.
2. Effectuez vos modifications dans le fichier `reddit.js`.
3. Committez vos modifications (`git commit -am 'Add new feature'`).
4. Push la branche (`git push origin master`).
5. Créez une nouvelle Pull Request.
