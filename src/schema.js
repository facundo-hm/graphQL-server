const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLInterfaceType
} = require('graphql')

const { grandTours, riders, editions } = require('./data')

const ENTITIES = ['grandTour', 'rider']

const SearchByNameType = new GraphQLUnionType({
  name: 'SearchByName',
  types() {
    return [GrandTourType, RiderType]
  },
  resolveType(data) {
    if (data.type === 'grandTour') {
      return GrandTourType
    }

    if (data.type === 'rider') {
      return RiderType
    }
  }
})

const SearchByCountryType = new GraphQLInterfaceType({
  name: 'SearchByCountry',
  fields: {
    searchCountryText: { type: GraphQLString }
  },
  resolveType(data) {
    if (data.region) {
      return GrandTourType
    }

    if (data.country) {
      return RiderType
    }
  }
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

const GrandTourType = new GraphQLObjectType({
  name: 'GrandTour',
  interfaces: [SearchByCountryType],
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
        const winnersId = editions.reduce((prev, edition) => {
          const tourEdition = edition.toursEditions.find(
            tourEdition => tourEdition.tourId === parent.id
          )

          return prev.concat(tourEdition.winnerId)
        }, [])

        return riders.filter(rider => winnersId.includes(rider.id))
      }
    },
    searchCountryText: {
      type: GraphQLString,
      resolve(data) {
        return `(Grand Tour) ${data.region}`
      }
    }
  })
})

const EditionType = new GraphQLObjectType({
  name: 'Edition',
  fields: () => ({
    id: { type: GraphQLID },
    year: { type: GraphQLInt },
    toursEditions: {
      type: new GraphQLList(TourWinnerType),
      resolve: parent => {
        return parent.toursEditions.map(tourEdition => ({
          grandTour: grandTours.find(
            grandTour => grandTour.id === tourEdition.tourId
          ),
          winner: riders.find(rider => rider.id === tourEdition.winnerId)
        }))
      }
    }
  })
})

const RiderType = new GraphQLObjectType({
  name: 'Rider',
  interfaces: [SearchByCountryType],
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
    status: { type: RiderStatus },
    victories: {
      type: new GraphQLList(VictoryType),
      resolve(parent, args) {
        return editions.reduce((prev, edition) => {
          const victories = edition.toursEditions
            .filter(tourEdition => tourEdition.winnerId === parent.id)
            .map(tourEdition => ({
              year: edition.year,
              grandTour: grandTours.find(
                grandTour => grandTour.id === tourEdition.tourId
              ).name
            }))

          return prev.concat(victories)
        }, [])
      }
    },
    searchCountryText: {
      type: GraphQLString,
      resolve(data) {
        return `(Rider) ${data.country}`
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

        return quantity ? editions.slice(0, quantity) : editions
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
    },

    searchByCountry: {
      type: new GraphQLList(SearchByCountryType),
      args: {
        text: { type: new GraphQLNonNull(GraphQLString) },
        entity: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(source, args) {
        const { text, entity } = args

        if (!entity || !ENTITIES.includes(entity)) {
          return []
        }

        const entityValues = entity === 'grandTour' ? grandTours : riders
        const entityProp = entity === 'grandTour' ? 'region' : 'country'

        return entityValues.filter(
          entityValue =>
            entityValue[entityProp].toLowerCase().indexOf(text) > -1
        )
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
        name: { type: new GraphQLNonNull(GraphQLString) },
        country: { type: GraphQLString }
      },
      resolve(parent, args) {
        const newId = riders.length + 1

        const rider = {
          id: newId.toString(),
          name: args.name,
          country: args.country
        }

        riders.push(rider)

        return rider
      }
    },

    updateRider: {
      type: RiderType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        country: { type: GraphQLString },
        status: { type: RiderStatus }
      },
      resolve(parent, args) {
        const rider = riders.find(rider => rider.id === args.id)

        rider.name = args.name || rider.name
        rider.country = args.country || rider.country
        rider.status = isFinite(args.status) ? args.status : rider.status

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
