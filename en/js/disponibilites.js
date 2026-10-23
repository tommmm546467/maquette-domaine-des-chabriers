/* Domaine des Chabriers : disponibilités lues par le panneau « Calendrier » (calendrier.js).
   Réservations données par Céline le 23/10/2026 (week-ends du vendredi au dimanche, rien d'ici fin 2026) ;
   chaque jour cité est réservé, le dernier compris (« 14-16 » = 14, 15 et 16 : [14, 17]) ;
   elles bloquent tout le domaine. Le 11 mai 2027 est une option, comptée comme prise. Sur le vrai site,
   elles viendront de l'agenda du domaine (application de gestion), sans rien changer au panneau.

   Trois choix (consigne de Tom du 23/10/2026) : tout le domaine en privatisation (mariage, réception,
   gros événement), le gîte A (le château) et le gîte C (la ferme). Les réservations se croisent : une
   privatisation bloque les deux gîtes ; un gîte réservé empêche de privatiser le domaine ces nuits-là.

   Pour chaque choix :
   - ouvreLe : première nuit possible (la ferme n'existe qu'à partir de son ouverture) ;
   - mois : mois d'ouverture dans l'année (1 = janvier), absent = ouvert toute l'année ;
   - toutelAnneeDes : à partir de cette nuit, ouvert toute l'année malgré « mois » (Céline, confirmé le 24/10/2026 : toute l'année dès 2027) ;
   - minimum : nuits minimum (au château, 3 l'été : voir calendrier.js) ;
   - projet : le choix du formulaire de contact prérempli ;
   - reserve : séjours déjà pris, [arrivée, départ] (la nuit du départ reste libre). */
window.DISPONIBILITES = {
  domaine: {
    nom: 'The whole estate',
    detail: 'Exclusive use · wedding, reception, large event',
    mois: [4, 5, 6, 7, 8, 9, 10],
    toutelAnneeDes: '2027-01-01',
    minimum: 1,
    projet: 'mariage',
    reserve: [
      ['2027-04-24', '2027-04-26'], ['2027-05-11', '2027-05-12'], ['2027-05-14', '2027-05-17'], ['2027-05-21', '2027-05-24'],
      ['2027-05-28', '2027-05-31'], ['2027-06-04', '2027-06-07'], ['2027-06-11', '2027-06-14'], ['2027-06-18', '2027-06-21'],
      ['2027-06-25', '2027-06-28'], ['2027-07-02', '2027-07-05'], ['2027-07-09', '2027-07-12'], ['2027-07-16', '2027-07-19'],
      ['2027-07-23', '2027-07-26'], ['2027-07-30', '2027-08-02'], ['2027-08-06', '2027-08-09'], ['2027-08-13', '2027-08-16'],
      ['2027-08-20', '2027-08-23'], ['2027-08-27', '2027-08-30'], ['2027-09-03', '2027-09-06'], ['2027-09-10', '2027-09-13'],
      ['2027-09-17', '2027-09-20'], ['2028-06-02', '2028-06-06'], ['2028-06-09', '2028-06-12'], ['2028-07-07', '2028-07-10'],
      ['2028-07-14', '2028-07-17'], ['2028-09-01', '2028-09-04']
    ]
  },
  chateau: {
    nom: 'Gîte A · The château',
    detail: '14 guests · 6 bedrooms',
    mois: [4, 5, 6, 7, 8, 9, 10],
    toutelAnneeDes: '2027-01-01',
    minimum: 2,
    projet: 'gite',
    reserve: []
  },
  ferme: {
    nom: 'Gîte C · The farmhouse',
    detail: 'Group gîte, studio, apartments · from April 2027',
    ouvreLe: '2027-04-01',
    minimum: 2,
    projet: 'gite',
    reserve: []
  }
};
