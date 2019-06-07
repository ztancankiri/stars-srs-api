const srs_food = require('../srs_api/srs_food');

module.exports = server => {
    server.get('/api/food', async (req, res) => {
        let menu;
        res.contentType = 'json';
        try {
            menu = await srs_food.get();
        } catch (e) {
            res.send({ error: e });
        } finally {
            res.send({ menu });
        }
    });
};
