CREATE RESOLVER
1. Create file in the associated directory (directory name doesn't matter).
2. Export an object which contains fields listed below:
		type: String [required] - Resolver type. Possible values: 'mutation', 'query'.
		name: String [required] - Resolver name
		roleAccess: Array[String] [optional] - List of roles who will have access to this resolver. If this field missed, it means everyone have access.
		typeDef: String [optional] - graphql definition of this resolver
		resolverFunc: Function [required] - function which will process the resolver call3. Be sure that application still can work.

EXAMPLE:
{
type: 'query',
name: 'hello',
roleAccess: ['owner', 'operator'],
typeDef: `
		extend type Query  {
	   	hello(name:String): String
	 	}
`,
resolverFunc: async (parent, { name }, { models }) => `Hello. ${name}! You are great =)`
}
