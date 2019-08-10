const restify = require('restify');
const plugins = restify.plugins;
const routes = require('./routes/index');

const server = restify.createServer();
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

server.listen(8888, '0.0.0.0', () => console.log('Listening on 8888...'));
routes.attachRoutes(server);
