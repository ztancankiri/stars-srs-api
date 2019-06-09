const srs_courses = require('../srs_api/srs_courses');

module.exports = server => {
    server.post('/api/courses', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let courses;
        res.contentType = 'json';
        try {
            courses = await srs_courses.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ courses });
        }
    });
};
