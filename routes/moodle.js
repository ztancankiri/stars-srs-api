const srs_moodle = require('../srs_api/srs_moodle');

module.exports = server => {
    server.post('/api/moodle', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let moodle;
        res.contentType = 'json';
        try {
            moodle = await srs_moodle.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ moodle });
        }
    });
};
