const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

async function parse(PHPSESSID, data) {
    const cookie = new tough.Cookie({
        key: 'PHPSESSID',
        value: PHPSESSID,
        domain: 'stars.bilkent.edu.tr',
        httpOnly: true,
        maxAge: 31536000
    });

    const cookieJar = rp.jar();
    cookieJar.setCookie(cookie, 'https://stars.bilkent.edu.tr');

    const options = {
        method: 'POST',
        url: 'https://stars.bilkent.edu.tr/html2pdf/',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/srs/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': config.user_agent,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
        },
        followAllRedirects: true,
        jar: cookieJar,
        form: {
            data: '<html><head><meta charset="utf-8"></head><body>' + data + '</body></html>'
        },
        encoding: null
    };

    let pdf;

    await rp(options)
        .then(data => {
            pdf = data.toString('base64');
        })
        .catch(err => {
            console.log(err);
        });

    return pdf;
}

async function getTranscript(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/transcript.php',
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
        .then(async data => {
            result = await parse(PHPSESSID, data);
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

module.exports.get = getTranscript;
