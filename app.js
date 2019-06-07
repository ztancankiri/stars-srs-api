const restify = require('restify');
const plugins = restify.plugins;

const server = restify.createServer();
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

server.listen(8888, '0.0.0.0', () => console.log('Listening on 8888...'));

require('./routes/login')(server);
require('./routes/grades')(server);
require('./routes/attend')(server);
require('./routes/moodle')(server);
require('./routes/food')(server);
