const srs_academiccalendar = require('../srs_api/srs_academiccalendar');

module.exports = server => {
    server.post('/api/academiccalendar', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let academiccalendar;
        res.contentType = 'json';
        try {
            academiccalendar = await srs_academiccalendar.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(academiccalendar);
        }
    });
};
