/* Domaine des Chabriers : disponibilités des logements, lues par le panneau « Calendrier » (calendrier.js).
   MAQUETTE : les réservations ci-dessous sont des exemples. Sur le vrai site, elles viendront de l'agenda
   du domaine (application de gestion), sans rien changer au panneau.

   Pour chaque logement :
   - ouvreLe : première nuit possible (la ferme n'existe qu'à partir de son ouverture) ;
   - mois : mois d'ouverture dans l'année (1 = janvier), absent = ouvert toute l'année ;
   - reserve : séjours déjà pris, [arrivée, départ] (la nuit du départ reste libre). */
window.DISPONIBILITES = {
  chateau: {
    nom: 'Le château',
    detail: 'Gîte A · 14 personnes',
    mois: [4, 5, 6, 7, 8, 9, 10],
    reserve: [
      ['2026-10-24', '2026-10-31'],
      ['2027-05-07', '2027-05-09'], ['2027-05-14', '2027-05-17'], ['2027-05-28', '2027-05-30'],
      ['2027-06-05', '2027-06-12'], ['2027-06-18', '2027-06-20'], ['2027-07-03', '2027-07-17'],
      ['2027-07-24', '2027-07-31'], ['2027-08-07', '2027-08-21'], ['2027-08-28', '2027-09-04'],
      ['2027-09-17', '2027-09-19'], ['2027-10-01', '2027-10-03'], ['2027-10-23', '2027-10-30']
    ]
  },
  'ferme-groupe': {
    nom: 'La ferme · gîte de groupe',
    detail: 'Gîte C · 14 personnes · dès avril 2027',
    ouvreLe: '2027-04-01',
    reserve: [['2027-04-16', '2027-04-18'], ['2027-05-14', '2027-05-17'], ['2027-07-10', '2027-07-24'], ['2027-08-14', '2027-08-21']]
  },
  'ferme-studio': {
    nom: 'La ferme · studio PMR',
    detail: 'Gîte C · 4 personnes · dès avril 2027',
    ouvreLe: '2027-04-01',
    reserve: [['2027-04-24', '2027-05-01'], ['2027-07-03', '2027-07-10'], ['2027-08-07', '2027-08-14']]
  },
  'ferme-appartement': {
    nom: 'La ferme · appartement',
    detail: 'Gîte C · 6 personnes · dès avril 2028',
    ouvreLe: '2028-04-01',
    reserve: [['2028-07-08', '2028-07-22']]
  }
};
