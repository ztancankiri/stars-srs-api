const srs_schedule = require('../srs_api/srs_schedule');

module.exports = server => {
    server.post('/api/schedule', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let schedule;
        res.contentType = 'json';
        try {
            schedule = await srs_schedule.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(schedule);
        }
    });
};
