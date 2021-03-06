const srs_lettergradestatgraph = require('../srs_api/srs_lettergradestatgraph');

module.exports = server => {
    server.post('/api/lettergradestatgraph', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;
        const graphID = req.body.graphID;

        let lettergradestatgraph;
        res.contentType = 'json';
        try {
            lettergradestatgraph = await srs_lettergradestatgraph.get(PHPSESSID, graphID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(lettergradestatgraph);
        }
    });
};
