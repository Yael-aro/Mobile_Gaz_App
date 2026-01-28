# ✅ CHECKLIST FINALE - TESTS AVANT PRODUCTION

## AUTHENTIFICATION
- [ ] Login Admin fonctionne
- [ ] Login Cantinier fonctionne
- [ ] Login Client fonctionne
- [ ] Logout fonctionne
- [ ] Mot de passe oublié envoie email
- [ ] Changement de mot de passe fonctionne
- [ ] Mauvais identifiants = message d'erreur clair

## ADMIN - BOUTEILLES
- [ ] Créer une bouteille
- [ ] Modifier une bouteille
- [ ] Supprimer une bouteille
- [ ] Filtrer par marque
- [ ] Filtrer par localisation
- [ ] Rechercher par numéro de série
- [ ] Générer QR code
- [ ] Scanner QR code
- [ ] Export PDF
- [ ] Export Excel

## ADMIN - CLIENTS
- [ ] Créer un client sans compte
- [ ] Créer un client avec compte (+ email envoyé)
- [ ] Modifier un client
- [ ] Supprimer un client
- [ ] Voir les bouteilles d'un client
- [ ] Rechercher un client

## ADMIN - MOUVEMENTS
- [ ] Créer mouvement: entrepôt → client
- [ ] Créer mouvement: client → cantinier
- [ ] Créer mouvement: cantinier → entrepôt
- [ ] Affichage nom du client correct
- [ ] Compteur bouteilles client mis à jour
- [ ] Filtrer les mouvements
- [ ] Historique complet visible

## CANTINIER
- [ ] Peut voir toutes les bouteilles
- [ ] NE PEUT PAS ajouter/modifier/supprimer bouteilles
- [ ] Peut voir tous les clients
- [ ] NE PEUT PAS ajouter/modifier/supprimer clients
- [ ] Peut créer des mouvements
- [ ] Badge "Mode Lecture Seule" visible

## CLIENT
- [ ] Voit uniquement ses bouteilles
- [ ] Voit son historique
- [ ] NE VOIT PAS les autres clients
- [ ] NE PEUT PAS modifier quoi que ce soit

## SÉCURITÉ
- [ ] Règles Firestore appliquées
- [ ] Routes protégées par rôle
- [ ] Cantinier ne peut pas accéder /reports
- [ ] Client ne peut pas accéder /bottles
- [ ] Variables d'environnement sécurisées

## PERFORMANCE
- [ ] Connexion < 2 secondes
- [ ] Chargement pages < 1 seconde
- [ ] Pas de lag lors des actions
- [ ] Rafraîchissement automatique des données

## RESPONSIVE
- [ ] Fonctionne sur mobile
- [ ] Fonctionne sur tablette
- [ ] Fonctionne sur desktop
- [ ] Menu adaptatif

## UX
- [ ] Messages d'erreur clairs
- [ ] Confirmations avant suppression
- [ ] Loading states visibles
- [ ] Toast notifications
- [ ] Page 404 personnalisée

## BACKUP
- [ ] Script de backup testé
- [ ] Backup manuel réussi
- [ ] Fichiers de backup vérifiés
