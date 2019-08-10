const srs_infocard = require('../srs_api/srs_infocard');

module.exports = server => {
    server.post('/api/infocard', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let infocard;
        res.contentType = 'json';
        try {
            infocard = await srs_infocard.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(infocard);
        }
    });
};
