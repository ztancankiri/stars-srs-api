module.exports.attachRoutes = server => {
    require('./login')(server);
    require('./grades')(server);
    require('./attend')(server);
    require('./moodle')(server);
    require('./food')(server);
    require('./fcount')(server);
    require('./courses')(server);
    require('./pcount')(server);
    require('./schedule')(server);
    require('./winfo')(server);
    require('./transcript')(server);
    require('./info')(server);
    require('./infocard')(server);
    require('./photo')(server);
    require('./lettergrade')(server);
    require('./lettergradestatgraph')(server);
};
