const srs_lettergrade = require('../srs_api/srs_lettergrade');

module.exports = server => {
    server.post('/api/lettergrade', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let lettergrade;
        res.contentType = 'json';
        try {
            lettergrade = await srs_lettergrade.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(lettergrade);
        }
    });
};
