const srs_attend = require('../srs_api/srs_attend');

module.exports = server => {
    server.post('/api/attend', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let attends;
        res.contentType = 'json';
        try {
            attends = await srs_attend.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ attends });
        }
    });
};
