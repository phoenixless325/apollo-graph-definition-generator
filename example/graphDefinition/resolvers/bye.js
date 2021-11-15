export default {
	type: 'mutation',
	name: 'bye',
	// language=graphql
	typeDef: `
			type Mutation{
          bye: String
      }
	`,
	resolverFunc: async (parent, { input }, { }) => {
		
		return 'Bye =)';
	}
};
