const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');
const regexParser = require('../util/regexParser');

async function getPhoto(PHPSESSID, url) {
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

async function parse(PHPSESSID, data) {
    const $ = cheerio.load(data);

    const info = {};
    info.photo = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1) > img').attr('src');
    info.first_name = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td').text();
    info.last_name = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td').text();
    info.depatment = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td').text();
    info.id = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td').text();
    info.cgpa = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(2)').text();
    info.standing = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(1) > tbody > tr.row2 > td:nth-child(2)').text();
    info.class = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2)').text();

    const regex = /Curriculum Semester : ([0-9]+) Registration Semester: ([0-9]+)/gm;
    const str = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(2) > tbody > tr > td')
        .text()
        .trim()
        .replace(/\t/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');

    const matches = regexParser(regex, str);

    info.curriculum_semester = matches[1];
    info.registration_semester = matches[2];
    info.phone = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr:nth-child(2) > td')
        .text()
        .trim();
    info.email = $('body > fieldset:nth-child(1) > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr.row2 > td > a').text();

    info.photo = await getPhoto(PHPSESSID, info.photo);

    return info;
}

async function getInfo(PHPSESSID) {
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

module.exports.get = getInfo;
