const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')

const { grandTours, riders, editions } = require('./data')

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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addRider: {
      type: RiderType,
      args: {
        name: { type: GraphQLString },
        country: { type: GraphQLString }
      },
      resolve(parent, args) {
        const rider = {
          id: riders.length + 1,
          name: args.name,
          age: args.age
        }

        riders.push(rider)

        return rider
      }
    },

    addEdition: {
      type: EditionType,
      args: {
        year: { type: GraphQLInt },
        winnerId: { type: GraphQLID },
        tourId: { type: GraphQLID }
      },
      resolve(parent, args) {
        const edition = {
          id: editions.length + 1,
          year: args.year,
          winnerId: args.winnerId,
          tourId: args.tourId
        }

        editions.push(edition)

        return edition
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
