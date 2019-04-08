const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLUnionType
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

const RiderStatus = new GraphQLEnumType({
  name: 'RiderStatusEnum',
  values: {
    RETIRED: {
      value: 0
    },
    ACTIVE: {
      value: 1
    }
  }
})

const RiderType = new GraphQLObjectType({
  name: 'Rider',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
    status: { type: RiderStatus },
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

const SearchByNameType = new GraphQLUnionType({
  name: 'SearchByNameType',
  types: [GrandTourType, RiderType],
  resolveType(data) {
    if (data.type === 'grandTour') {
      return GrandTourType
    }

    if (data.type === 'rider') {
      return RiderType
    }
  }
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    grandTour: {
      type: GrandTourType,
      args: { id: { type: GraphQLID } },
      resolve(source, args) {
        return grandTours.find(grandTour => grandTour.id === args.id)
      }
    },

    rider: {
      type: RiderType,
      args: { id: { type: GraphQLID } },
      resolve(source, args) {
        return riders.find(rider => rider.id === args.id)
      }
    },

    edition: {
      type: EditionType,
      args: { year: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve(source, args) {
        return editions.find(edition => edition.year === args.year)
      }
    },

    grandTours: {
      type: new GraphQLList(GrandTourType),
      args: { quantity: { type: GraphQLInt } },
      resolve(source, args) {
        const { quantity } = args

        return quantity ? grandTours.slice(0, quantity) : grandTours
      }
    },

    riders: {
      type: new GraphQLList(RiderType),
      args: { quantity: { type: GraphQLInt } },
      resolve(source, args) {
        const { quantity } = args

        return quantity ? riders.slice(0, quantity) : riders
      }
    },

    editions: {
      type: new GraphQLList(EditionType),
      args: { quantity: { type: GraphQLInt } },
      resolve(source, args) {
        const { quantity } = args

        const editionsList = editions.reduce((prev, edition) => {
          const alreadyAdded = prev.find(val => val.year === edition.year)

          if (!alreadyAdded) {
            prev.push(edition)
          }

          return prev
        }, [])

        return quantity ? editionsList.slice(0, quantity) : editionsList
      }
    },

    searchByName: {
      type: new GraphQLList(SearchByNameType),
      args: {
        text: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(source, args) {
        const { text } = args

        const filteredTours = grandTours
          .filter(gt => gt.name.toLowerCase().indexOf(text) > -1)
          .map(gt => Object.assign({}, gt, { type: 'grandTour' }))

        const filteredRiders = riders
          .filter(rider => rider.name.toLowerCase().indexOf(text) > -1)
          .map(rider => Object.assign({}, rider, { type: 'rider' }))

        return [...filteredTours, ...filteredRiders]
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
