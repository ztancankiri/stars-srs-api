const path = require('path');
const fs = require('fs');

const getFiles = dir => {
	try {
		if (fs.existsSync(dir)) {
			if (fs.lstatSync(dir).isDirectory()) {
				return fs.readdirSync(dir);
			} else {
				console.log(`"${dir}" is not a directory.`);
				return null;
			}
		} else {
			console.log(`"${dir}" does not exist.`);
			return null;
		}
	} catch (e) {
		console.log(e);
	}
	return null;
};

module.exports.attachRoutes = server => {
	const routesPath = path.join(process.cwd(), 'routes');
	const routeFiles = getFiles(routesPath);
	routeFiles.splice(routeFiles.indexOf('index.js'), 1);
	const routePaths = routeFiles.map(route => path.join(process.cwd(), 'routes', route));

	routePaths.forEach(route => {
		require(route)(server);
	});
};
