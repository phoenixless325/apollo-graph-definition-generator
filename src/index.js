import { combineResolvers } from 'graphql-resolvers';
import requireAll from './requireAll';
import capitalize from 'lodash.capitalize';
import transform from 'lodash.transform';
import set from 'lodash.set';
import generateEnums from './generateEnums';

/*
* CREATE RESOLVER
*
* 1. Create file in the associated directory (directory name doesn't matter).
* 2. Export an object which contains fields listed below:
* 		type: String [required] - Resolver type. Possible values: 'mutation', 'query'.
* 		name: String [required] - Resolver name
* 		roleAccess: Array[String] [optional] - List of roles who will have access to this resolver. If this field missed, it means everyone have access.
* 		typeDef: String [optional] - graphql definition of this resolver
* 		resolverFunc: Function [required] - function which will process the resolver call
* 3. Be sure that application still can work.
*
* EXAMPLE:
* {
*  	type: 'query',
*		name: 'hello',
*		roleAccess: ['owner', 'operator'],
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

const defaultLogger = {
	info: console.log,
	warn: console.warn,
	error: console.error
};

const graphDefinitionGenerator = ({ typeDefs = '', resolversDir, prepareMiddlewares, logger = defaultLogger, enumsDir, enumsKeywords = [], generatedEnums }) => {
	
	const enums = generatedEnums || generateEnums(enumsDir, enumsKeywords);
	const enumsTypeDef = transform(enums, (acc, val, key) => acc.push(` enum ${key} {${Object.keys(val)}}`), []).join(' ');
	
	if(!Array.isArray(prepareMiddlewares))
		prepareMiddlewares = [prepareMiddlewares];
	
	let resolvers = requireAll({
		dirname: resolversDir,
		filter: /(.+)\.js$/,
		recursive: true
	});
	
	let typeDefinitions = `${enumsTypeDef} ${typeDefs}`;
	
	logger.info('Resolvers loading...');
	
	resolvers =
		resolvers
			.reduce((acc, resolver) => {
				let res = resolver.content.default;
				
				if (!res) {
					logger.warn(`[WARN] File "${resolver.filePath}" should return resolver`);
					return acc;
				}
				
				let error = null;
				
				if (!res.resolverFunc || (typeof res.resolverFunc !== 'function' && res.type !== 'scalar'))
					error = `Resolver[${res.name}] resolverFunc required and should be type of Function`;
				
				if (!res.type || !['mutation', 'query', 'scalar', 'subscription'].includes(res.type.toLowerCase()))
					error = `Resolver[${res.name}] type missing or has incorrect type - "${res.type}". Possible values ['mutation', 'query', 'scalar','subscription']`;
				
				if (res.typeDef === void 0 || typeof res.typeDef !== 'string')
					error = `Resolver[${res.name}] typeDef required and should be type of String`;
				
				if (!res.name || typeof res.name !== 'string')
					error = `Resolver name required and should be type of String`;
				
				
				if (error) {
					logger.warn(`${error} [${resolver.filePath}]`);
					return acc;
				}
				
				if(res.typeDef)
					typeDefinitions += res.typeDef;
				
				return [res, ...acc];
			}, [])
			.reduce((acc, resolver) => {
				let middlewares = [];
				
				for(const prepare of prepareMiddlewares){
					if(typeof prepare !== 'function') {
						logger.error(`prepareMiddlewares: expected type 'function', got '${typeof prepare}'`);
						continue;
					}
					const middleware = prepare(resolver);
					
					if(!middleware)
						continue;
					
					if(typeof middleware !== 'function') {
						logger.error(`prepareMiddlewares: expected return type 'function', got '${typeof middleware}'`);
						continue;
					}
					middlewares.push(middleware);
				}
				
				if (resolver.type === 'scalar')
					acc[resolver.name] = resolver.resolverFunc;
				else {
					const resolverMiddlewares = combineResolvers.apply(null, [...middlewares, resolver.resolverFunc]);
					
					const resolverValue = resolver.type === 'subscription'
						? { subscribe: resolverMiddlewares }
						: resolverMiddlewares;
					
					set(acc, `${capitalize(resolver.type)}.${resolver.name}`, resolverValue);
				}
				
				return acc;
			}, { ...enums });
	
	
	
	logger.info('Resolvers loaded.');
	
	
	return {
		resolvers,
		typeDefs: typeDefinitions,
		enums
	};
};

export default graphDefinitionGenerator;

export {
	graphDefinitionGenerator,
	generateEnums
}
