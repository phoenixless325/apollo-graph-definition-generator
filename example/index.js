import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from 'apollo-server-express';
import { resolvers, typeDefs } from './graphDefinition';

const server = new ApolloServer({ resolvers, typeDefs });

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

server.start().then(() => {
	server.applyMiddleware({ app });
	
	app.listen(8000, () => {
		console.log(`GraphQL server started!!!`);
	});
});


