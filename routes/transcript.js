const srs_transcript = require('../srs_api/srs_transcript');

module.exports = server => {
    server.post('/api/transcript', async (req, res) => {
        const PHPSESSID = req.body.PHPSESSID;

        let transcript;
        res.contentType = 'application/pdf';
        try {
            transcript = await srs_transcript.get(PHPSESSID);
        } catch (e) {
            res.send({ error: e });
        } finally {
            //console.log(transcript);
            res.send(transcript);
        }
    });
};
