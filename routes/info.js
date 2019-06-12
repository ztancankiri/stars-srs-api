const srs_info = require('../srs_api/srs_info');

module.exports = server => {
    server.post('/api/info', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let info;
        res.contentType = 'json';
        try {
            info = await srs_info.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(info);
        }
    });
};
