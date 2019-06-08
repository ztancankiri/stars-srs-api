const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

function parse(data) {
    const $ = cheerio.load(data);

    const pageNotes = $("div[class='pageNotes']");
    const badges = $(pageNotes).find("span[class='badge']");
    const count = $(badges[2]).text();

    return { remaining_meal: count };
}

async function getFCount(PHPSESSID) {
    const cookie = new tough.Cookie({
        key: 'PHPSESSID',
        value: PHPSESSID,
        domain: 'stars.bilkent.edu.tr',
        httpOnly: true,
        maxAge: 31536000
    });

    let result;

    const cookieJar = rp.jar();
    cookieJar.setCookie(cookie, 'https://stars.bilkent.edu.tr');

    const options = {
        method: 'GET',
        url: 'https://stars.bilkent.edu.tr/srs-v2/meal/order',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/srs/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': config.user_agent
        },
        followAllRedirects: true,
        jar: cookieJar
    };

    await rp(options)
        .then(data => {
            result = parse(data);
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

module.exports.get = getFCount;
