const cheerio = require('cheerio');
const restify = require('restify');
const plugins = restify.plugins;

const login = require('./srs_api/login');
const grades = require('./srs_api/grades');

const server = restify.createServer();
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

server.listen(8888, '0.0.0.0', () => console.log('Listening on 8888...'));

require('./routes/get_grades')(server);

async function run() {
    await login.login();
    console.log(await grades.get(login.getSession()));
}

run();
