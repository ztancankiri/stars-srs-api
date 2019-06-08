const srs_fcount = require('../srs_api/srs_fcount');

module.exports = server => {
    server.post('/api/fcount', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let fcount;
        res.contentType = 'json';
        try {
            fcount = await srs_fcount.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ fcount });
        }
    });
};
