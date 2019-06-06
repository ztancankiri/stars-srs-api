const srs_grades = require('../srs_api/srs_grades');

module.exports = server => {
    server.post('/api/grades', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let grades;
        res.contentType = 'json';
        try {
            grades = await srs_grades.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ grades });
        }
    });
};
