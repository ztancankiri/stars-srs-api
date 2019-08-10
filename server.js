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
require('./routes/fcount')(server);
require('./routes/courses')(server);
require('./routes/pcount')(server);
require('./routes/schedule')(server);
require('./routes/winfo')(server);
require('./routes/transcript')(server);
require('./routes/info')(server);
require('./routes/infocard')(server);
require('./routes/photo')(server);
require('./routes/lettergrade')(server);
require('./routes/lettergradestatgraph')(server);