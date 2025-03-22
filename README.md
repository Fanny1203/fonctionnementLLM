# Fonctionnement d'un LLM - Démonstration Interactive

Cette application web interactive montre de manière simplifiée le fonctionnement d'un modèle de langage (LLM - Large Language Model) à travers une visualisation animée.

## Fonctionnalités

L'application se déroule en trois phases principales :

1. **Récolte des données**
   - Présentation du jeu de données d'entraînement
   - Visualisation des paires entrée-sortie
   - pas d'intéraction à cette étape, passer à la suite

2. **Entraînement**
   - Visualisation du réseau avec des engrenages animés
   - Calcul et affichage des distributions de probabilité
   - Animation du processus de correction et d'ajustement
   - On peut choisir les phrases sur lesquelles entrainer le modèle : d'abord on calcule, puis on corrige (essai/erreur)

3. **Utilisation**
   - Test du modèle entraîné sur de nouvelles phrases
   - Génération de mots suivants avec leurs probabilités
   - Démonstration de la généralisation du modèle
   - On peut faire calculer la prédiction, puis choisir parmi les mots prédits. Le mot tiré au sort d'ajoute à la phrase de départ et on peut recommencer (jusqu'à 5 mots, on passe ensuite à la conclusion)

## Technologies utilisées

- **p5.js** : Pour le rendu graphique et les animations
- **HTML/CSS** : Pour l'interface utilisateur
- **JavaScript** : Pour la logique de l'application

## Installation

1. Clonez ce dépôt
2. Ouvrez `index.html` dans un navigateur web moderne

## Structure du code

- `index.html` : Structure de la page et chargement des dépendances
- `sketch.js` : Logique principale de l'application
  - Configuration et constantes
  - Gestion des états et transitions
  - Fonctions de dessin et d'animation
- `styles.css` : Mise en forme de l'interface
- `gear.svg` : Image d'engrenage pour la visualisation

## États du système

L'application utilise plusieurs états pour gérer les différentes phases :

### États d'entraînement
- `INITIAL` : État initial
- `CALCULATED` : Distribution calculée
- `CORRECTING` : Animation de correction en cours
- `CORRECTED` : Correction terminée

### États d'utilisation
- `INITIAL` : État initial
- `CALCULATING` : Calcul en cours
- `SELECTED` : Mot sélectionné

## Performance

L'application utilise plusieurs optimisations pour garantir une expérience fluide :
- Pré-rendu des éléments statiques
- Limitation du framerate
- Mise en cache des positions des engrenages (ça s'est révélé déterminant !)
