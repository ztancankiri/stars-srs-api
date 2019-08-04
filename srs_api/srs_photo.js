const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

async function parse(PHPSESSID, data) {
    const $ = cheerio.load(data);

    const photoURL = $('img').attr('src');

    const result = {};
    result.photoB64encoded = await grabPhoto(PHPSESSID, photoURL);

    return result;
}

async function grabPhoto(PHPSESSID, url) {
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
        method: 'GET',
        url: url,
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/srs/',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': config.user_agent
        },
        followAllRedirects: true,
        jar: cookieJar,
        encoding: null
    };

    let photo;

    await rp(options)
        .then(data => {
            photo = data.toString('base64');
        })
        .catch(err => {
            console.log(err);
        });

    return photo;
}

async function getPhoto(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/userInfo.php',
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

module.exports.get = getPhoto;
