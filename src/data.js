exports.grandTours = [
  {
    id: '1',
    name: "Giro d'Italia",
    date: 'May–June',
    region: 'Italy',
    firstEdition: 1909,
    editions: 101,
    jerseyColor: 'Pink'
  },
  {
    id: '2',
    name: 'Tour de France',
    date: 'July',
    region: 'France',
    firstEdition: 1903,
    editions: 105,
    jerseyColor: 'Yellow'
  },
  {
    id: '3',
    name: 'Vuelta a España',
    date: 'August–September',
    region: 'Spain',
    firstEdition: 1935,
    editions: 73,
    jerseyColor: 'Red'
  }
]

exports.riders = [
  { id: '1', name: 'Chris Froome', country: 'Great Britain', status: 1 },
  { id: '2', name: 'Geraint Thomas', country: 'Great Britain', status: 1 },
  { id: '3', name: 'Simon Yates', country: 'Great Britain', status: 1 },
  { id: '4', name: 'Tom Dumoulin', country: 'Netherlands', status: 1 },
  { id: '5', name: 'Vincenzo Nibali', country: 'Italy', status: 1 },
  { id: '6', name: 'Nairo Quintana', country: 'Colombia', status: 1 },
  { id: '7', name: 'Alberto Contador', country: 'Spain', status: 0 },
  { id: '8', name: 'Fabio Aru', country: 'Italy', status: 1 }
]

exports.editions = [
  {
    id: '1',
    year: 2015,
    toursEditions: [
      { winnerId: '7', tourId: '1' },
      { winnerId: '1', tourId: '2' },
      { winnerId: '8', tourId: '3' }
    ]
  },
  {
    id: '2',
    year: 2016,
    toursEditions: [
      { winnerId: '5', tourId: '1' },
      { winnerId: '1', tourId: '2' },
      { winnerId: '6', tourId: '3' }
    ]
  },
  {
    id: '3',
    year: 2017,
    toursEditions: [
      { winnerId: '4', tourId: '1' },
      { winnerId: '1', tourId: '2' },
      { winnerId: '1', tourId: '3' }
    ]
  },
  {
    id: '4',
    year: 2018,
    toursEditions: [
      { winnerId: '1', tourId: '1' },
      { winnerId: '2', tourId: '2' },
      { winnerId: '3', tourId: '3' }
    ]
  }
]
