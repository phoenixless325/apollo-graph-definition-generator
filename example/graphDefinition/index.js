import path from 'path';
import typeDefinitions from './typeDefs';

/*
* CREATE RESOLVER
*
* 1. Create file in the associated directory (directory name doesn't matter).
* 2. Export an object which contains fields listed below:
* 		type: String [required] - Resolver type. Possible values: 'mutation', 'query'.
* 		name: String [required] - Resolver name
* 		typeDef: String [required] - graphql definition of this resolver
* 		resolverFunc: Function [required] - function which will process the resolver call
* 3. Be sure that application still work.
*
* EXAMPLE:
* {
*  	type: 'query',
*		name: 'hello',
*		typeDef: `
*			extend type Query  {
* 	   	hello(name:String): String
* 	 	}
*		`,
*	 resolverFunc: async (parent, { name }, { models }) => `Hello. ${name}! You are great =)`
* }
*
* THAT'S ALL =) YOU ARE THE BEST CODER EVER NOW =)
* */


import graphDefinitionGenerator from 'apollo-graph-definition-generator';

const { resolvers, typeDefs, enums } = graphDefinitionGenerator({
	typeDefs: typeDefinitions,
	resolversDir: path.resolve(__dirname, 'resolvers'),
	prepareMiddlewares: [
		resolver => {
			return (root, args) => {
				// validate args for example
			};
		}
	],
	enumsDir: path.resolve(__dirname, '..', 'constants'),
	enumsKeywords: []
});

export { resolvers, typeDefs, enums };

