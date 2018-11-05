const graphql = require('graphql')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = graphql

const grandTours = [
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

const riders = [
  { id: '1', name: 'Chris Froome', country: 'Great Britain' },
  { id: '2', name: 'Geraint Thomas', country: 'Great Britain' },
  { id: '3', name: 'Simon Yates', country: 'Great Britain' },
  { id: '4', name: 'Tom Dumoulin', country: 'Netherlands' },
  { id: '5', name: 'Vincenzo Nibali', country: 'Italy' },
  { id: '6', name: 'Nairo Quintana', country: 'Colombia' },
  { id: '7', name: 'Alberto Contador', country: 'Spain' },
  { id: '8', name: 'Fabio Aru', country: 'Italy' }
]

const editions = [
  { id: '1', year: 2015, winnerId: '7', tourId: '1' },
  { id: '2', year: 2015, winnerId: '1', tourId: '2' },
  { id: '3', year: 2015, winnerId: '8', tourId: '3' },
  { id: '4', year: 2016, winnerId: '5', tourId: '1' },
  { id: '5', year: 2016, winnerId: '1', tourId: '2' },
  { id: '6', year: 2016, winnerId: '6', tourId: '3' },
  { id: '7', year: 2017, winnerId: '4', tourId: '1' },
  { id: '8', year: 2017, winnerId: '1', tourId: '2' },
  { id: '9', year: 2017, winnerId: '1', tourId: '3' },
  { id: '10', year: 2018, winnerId: '1', tourId: '1' },
  { id: '11', year: 2018, winnerId: '2', tourId: '2' },
  { id: '12', year: 2018, winnerId: '3', tourId: '3' }
]

const GrandTourType = new GraphQLObjectType({
  name: 'GrandTour',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    date: { type: GraphQLString },
    region: { type: GraphQLString },
    firstEdition: { type: GraphQLInt },
    editions: { type: GraphQLInt },
    jerseyColor: { type: GraphQLString },
    winners: {
      type: new GraphQLList(RiderType),
      resolve(parent, args) {
        const tourEditions = editions
          .filter(edition => edition.tourId === parent.id)
          .map(edition => edition.winnerId)

        return riders.filter(rider => tourEditions.includes(rider.id))
      }
    }
  })
})

const EditionType = new GraphQLObjectType({
  name: 'Edition',
  fields: () => ({
    id: { type: GraphQLID },
    year: { type: GraphQLInt },
    grandTours: {
      type: new GraphQLList(TourWinnerType),
      resolve: (parent, args) => {
        return editions
          .filter(edition => edition.year === parent.year)
          .map(edition => ({
            grandTour: grandTours.find(
              grandTour => grandTour.id === edition.tourId
            ),
            winner: riders.find(rider => rider.id === edition.winnerId)
          }))
      }
    }
  })
})

const RiderType = new GraphQLObjectType({
  name: 'Rider',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
    victories: {
      type: new GraphQLList(VictoryType),
      resolve(parent, args) {
        return editions
          .filter(edition => edition.winnerId === parent.id)
          .map(edition => ({
            year: edition.year,
            grandTour: grandTours.find(
              grandTour => grandTour.id === edition.tourId
            ).name
          }))
      }
    }
  })
})

const VictoryType = new GraphQLObjectType({
  name: 'Victory',
  fields: () => ({
    grandTour: { type: GraphQLString },
    year: { type: GraphQLInt }
  })
})

const TourWinnerType = new GraphQLObjectType({
  name: 'TourWinner',
  fields: () => ({
    grandTour: { type: GrandTourType },
    winner: { type: RiderType }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    grandTour: {
      type: GrandTourType,
      args: { id: { type: GraphQLID } },
      resolve(root, args) {
        return grandTours.find(grandTour => grandTour.id === args.id)
      }
    },

    rider: {
      type: RiderType,
      args: { id: { type: GraphQLID } },
      resolve(root, args) {
        return riders.find(rider => rider.id === args.id)
      }
    },

    edition: {
      type: EditionType,
      args: { year: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve(root, args) {
        return editions.find(edition => edition.year === args.year)
      }
    },

    grandTours: {
      type: new GraphQLList(GrandTourType),
      resolve() {
        return grandTours
      }
    },

    riders: {
      type: new GraphQLList(RiderType),
      resolve() {
        return riders
      }
    },

    editions: {
      type: new GraphQLList(EditionType),
      resolve() {
        return editions.reduce((prev, edition) => {
          const alreadyAdded = prev.find(val => val.year === edition.year)

          if (!alreadyAdded) {
            prev.push(edition)
          }

          return prev
        }, [])
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
