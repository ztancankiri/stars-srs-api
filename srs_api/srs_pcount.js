const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');
const regexParser = require('../util/regexParser');

function parse(data) {
    const $ = cheerio.load(data);

    const pages = $("span[class='text-success']");

    const regex = /[0-9]+/gm;
    const count = $(pages).text();
    const matches = regexParser(regex, count);

    return { print_count: parseInt(matches[0]) };
}

async function getPCount(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs-v2/order/print-quota/',
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

module.exports.get = getPCount;
