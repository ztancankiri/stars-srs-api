const srs_pcount = require('../srs_api/srs_pcount');

module.exports = server => {
    server.post('/api/pcount', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let pcount;
        res.contentType = 'json';
        try {
            pcount = await srs_pcount.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(pcount);
        }
    });
};
