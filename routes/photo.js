const srs_photo = require('../srs_api/srs_photo');

module.exports = server => {
    server.post('/api/photo', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let photo;
        res.contentType = 'json';
        try {
            photo = await srs_photo.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(photo);
        }
    });
};
