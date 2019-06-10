const srs_winfo = require('../srs_api/srs_winfo');

module.exports = server => {
    server.post('/api/winfo', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let winfo;
        res.contentType = 'json';
        try {
            winfo = await srs_winfo.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send(winfo);
        }
    });
};
