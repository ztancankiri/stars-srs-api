module.exports = server => {
    server.get('/api/grades/', (req, res) => {
        const account_id = req.user.id;
        db.query('SELECT * FROM `EventCard` NATURAL JOIN `Attend` WHERE status = 2 AND account_id = ?', [account_id])
            .then(data => {
                console.log(data);
                res.send(data);
            })
            .catch(error => {
                console.log(error);
                res.send(400, []);
            });
    });
};
