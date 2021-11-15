## Intro
The apollo-graph-definition-generator is designed to help you conveniently generate graphql schema.

This library was designed for individual use, but if I see an increase in demand, I will maintain and expand the functionality in accordance with the wishes of users

## Getting Started
You can use completed [example](https://github.com/phoenixless325/apollo-graph-definition-generator/tree/master/example) for starting work with apollo-graph-definition-generator.

## graphDefinitionGenerator

| Param | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| typeDefs | false | string | Graphql type definition which generator will concat with generated typedefs. |
| resolversDir | true | string | Path to directory with resolvers. |
| prepareMiddlewares | false | array[function] | Each function in this array should return apollo middleware. | 
| logger | false | object | You can specify the logger lib will use. Logger should implement methods: 'info', 'warn', 'error'. By default uses console interface. | 
| enumsDir | false | string | Path to your constants directory. See Enums section. You can define enums typeDefs by yourself. |
| enumsKeywords | false | array[string] | See Enums section for more details |

## Resolver File Format

**CREATE RESOLVER**
1. Create file in the associated directory (directory name doesn't matter).
2. Export an object which contains fields listed below:
```
	type: String [required] - Resolver type. Possible values: 'mutation', 'query'.
	name: String [required] - Resolver name
	roleAccess: Array[String] [optional] - List of roles who will have access to this resolver. If this field missed, it means everyone have access.
	typeDef: String [optional] - graphql definition of this resolver
	resolverFunc: Function [required] - function which will process the resolver call3. Be sure that application still can work.
```
        
**EXAMPLE:**
```javascript
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
```

## Enums

This document describes the behavior of the enumeration library.

**Introduction**

The library was created to simplify the work with enumerations and allows you to generate them automatically from constants.

The scheme of its work is quite simple:

1. All js files from the constants directory are read
2. The name of each constant from the file is searched for an occurrence of the 'keyword'
3. To form the name of the enumeration, the file name and the entry of the keyword are used. If no match was found, the enumeration will be named the same as the file

**Example of work**

Let's consider various cases of enumeration formation.
Suppose there is a *constants/Car.js* file containing
```angular2html
export const CAR_TYPE_SEDAN = 'sedan';
export const CAR_TYPE_HATCHBACK = 'hatchback';
export const CAR_TRANSMISSION_TYPE_MANUAL = 'manual';
export const CAR_TRANSMISSION_TYPE_AUTOMATIC = 'automatic';

export const CAR_COLOR_RED = 'red';
export const CAR_COLOR_BLACK = 'black';
```
If you do not specify any keywords in the lib configuration, a single Car enumeration will be created based on this file:
```angular2html
Car:{
    "CAR_TYPE_SEDAN": "sedan',
    "CAR_TYPE_HATCHBACK": "hatchback',
    "CAR_TRANSMISSION_TYPE_MANUAL": "manual',
    "CAR_TRANSMISSION_TYPE_AUTOMATIC": "automatic',
    "CAR_COLOR_RED": "red',
    "CAR_COLOR_BLACK": "black',
}
```
If we specify two keywords - *'RED'* and *'TYPE'*, based on the *Car.js* file, two enumerations will be coded, with names like
```angular2html
[name of file][keyword]
```
Thus, we get the following enumerations:
```angular2html
CarType:{
    "CAR_TYPE_SEDAN": "sedan',
    "CAR_TYPE_HATCHBACK": "hatchback',
    "CAR_TRANSMISSION_TYPE_MANUAL": "manual',
    "CAR_TRANSMISSION_TYPE_AUTOMATIC": "automatic'
},
CarColor:{
    "CAR_COLOR_RED": "red',
    "CAR_COLOR_BLACK": "black'
}
```
This is not entirely correct behavior, since there is a need to form three enumerations:
*CarType, CarTransmissionType* and *CarColor*.

Please note that the search for keywords is performed by their occurrence in the name of the constant.
Thus, in the first four constants the keyword *'TYPE'* was found, and in two more - the keyword *'RED'*.
It follows from this that if you have keywords *A* and *B*, and *A* is a substring of *B*, then in the configuration of keywords *B* must necessarily come before *A*.

For example, if we set the keywords as
```angular2html
'RED','TYPE','TRANSMISSION_TYPE'
```
the result will not change, we will still get two enumerations.
This is because the library detects the *'TYPE'* keyword before it checks for occurrences of the keyword *'TRANSMISSION_TYPE'* in constant names.

But if you change the order of keywords as follows
```angular2html
'RED', 'TRANSMISSION_TYPE', 'TYPE'
```
three enumerations will be generated:
```angular2html
CarTransmissionType:{
"CAR_TRANSMISSION_TYPE_MANUAL": "manual',
"CAR_TRANSMISSION_TYPE_AUTOMATIC": "automatic'
},
CarType:{
    "CAR_TYPE_SEDAN": "sedan',
    "CAR_TYPE_HATCHBACK": "hatchback',
},
CarColor:{
    "CAR_COLOR_RED": "red',
    "CAR_COLOR_BLACK": "black'
}
```
