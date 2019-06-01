const cheerio = require('cheerio');
const login = require('./login');

async function getGrades(rp) {
    const options = {
        method: 'GET',
        url: 'https://stars.bilkent.edu.tr/srs/ajax/gradeAndAttend/grade.php',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/srs/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        },
        followAllRedirects: true
    };

    await rp(options)
        .then($ => {
            console.log($);
        })
        .catch(err => {
            console.log(err);
        });
}

async function run() {
    await login.login();
    getGrades(login.getSession());
}

async function test() {
    const codeData = await rec.receive(config, 'ZVMK');
    const codeObj = codeExtractor(codeData.text);

    console.log(codeObj);
}

//test();

run();
