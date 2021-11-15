export default {
	type: 'query',
	name: 'hello',
	// language=graphql
	typeDef: `
			type Query{
          hello: String
      }
	`,
	resolverFunc: async (parent, { input }, { }) => {
		
		return 'Hello =)';
	}
};
