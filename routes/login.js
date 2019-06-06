const srs_login = require('../srs_api/srs_login');

module.exports = server => {
    server.post('/api/login', async (req, res) => {
        const credentials = {};

        credentials.email_username = req.body.email_username;
        credentials.email_password = req.body.email_password;
        credentials.srs_username = req.body.srs_username;
        credentials.srs_password = req.body.srs_password;

        let PHPSESSID = '';
        res.contentType = 'json';
        try {
            PHPSESSID = await srs_login.login(credentials);
        } catch (e) {
            res.send({ error: e });
        } finally {
            const result = { PHPSESSID };
            console.log(result);
            res.send(result);
        }
    });
};
