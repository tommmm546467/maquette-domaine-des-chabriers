/* Domaine des Chabriers : disponibilités lues par le panneau « Calendrier » (calendrier.js).
   MAQUETTE : les réservations ci-dessous sont des exemples. Sur le vrai site, elles viendront de l'agenda
   du domaine (application de gestion), sans rien changer au panneau.

   Trois choix (consigne de Tom du 23/10/2026) : tout le domaine en privatisation (mariage, réception,
   gros événement), le gîte A (le château) et le gîte C (la ferme). Les réservations se croisent : une
   privatisation bloque les deux gîtes ; un gîte réservé empêche de privatiser le domaine ces nuits-là.

   Pour chaque choix :
   - ouvreLe : première nuit possible (la ferme n'existe qu'à partir de son ouverture) ;
   - mois : mois d'ouverture dans l'année (1 = janvier), absent = ouvert toute l'année ;
   - minimum : nuits minimum (au château, 3 l'été : voir calendrier.js) ;
   - projet : le choix du formulaire de contact prérempli ;
   - reserve : séjours déjà pris, [arrivée, départ] (la nuit du départ reste libre). */
window.DISPONIBILITES = {
  domaine: {
    nom: 'The whole estate',
    detail: 'Exclusive use · wedding, reception, large event',
    mois: [4, 5, 6, 7, 8, 9, 10],
    minimum: 1,
    projet: 'mariage',
    reserve: [['2027-05-22', '2027-05-24'], ['2027-06-26', '2027-06-28'], ['2027-09-11', '2027-09-13'], ['2027-09-25', '2027-09-27']]
  },
  chateau: {
    nom: 'Gîte A · The château',
    detail: '14 guests · 6 bedrooms',
    mois: [4, 5, 6, 7, 8, 9, 10],
    minimum: 2,
    projet: 'gite',
    reserve: [
      ['2026-10-24', '2026-10-31'],
      ['2027-05-07', '2027-05-09'], ['2027-05-14', '2027-05-17'], ['2027-05-28', '2027-05-30'],
      ['2027-06-05', '2027-06-12'], ['2027-06-18', '2027-06-20'], ['2027-07-03', '2027-07-17'],
      ['2027-07-24', '2027-07-31'], ['2027-08-07', '2027-08-21'], ['2027-08-28', '2027-09-04'],
      ['2027-09-17', '2027-09-19'], ['2027-10-01', '2027-10-03'], ['2027-10-23', '2027-10-30']
    ]
  },
  ferme: {
    nom: 'Gîte C · The farmhouse',
    detail: 'Group gîte, studio, apartments · from April 2027',
    ouvreLe: '2027-04-01',
    minimum: 2,
    projet: 'gite',
    reserve: [['2027-04-16', '2027-04-18'], ['2027-05-14', '2027-05-17'], ['2027-07-10', '2027-07-24'], ['2027-08-14', '2027-08-21']]
  }
};
