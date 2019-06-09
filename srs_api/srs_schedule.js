const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');
const regexParser = require('../util/regexParser');

function parse(data) {
    const $ = cheerio.load(data);

    const table = $('table[cellspacing=2]');
    const tbody = $(table).find('tbody');
    const trs = $(tbody).find('tr[class=row1],[class=row2]');

    const hours = [];
    const list = [];

    trs.each((i, tr) => {
        const tds = $(tr).find('td');
        const days = [];
        tds.each((j, td) => {
            if (j === 0) {
                list.push($(td).text());
            } else {
                if ($(td).is("[style*='border:0px']")) {
                    const cInfo = $(td).text();
                    const regex = /([A-Z\s0-9]+)-([0-9]+)(\()([A-Z\-0-9]+)(\))/gm;

                    const cObj = {};
                    if (cInfo.includes('[M]')) {
                        const str = cInfo.replace('[M]', '');
                        const matches = regexParser(regex, str);

                        cObj.course = matches[1];
                        cObj.section = matches[2];
                        cObj.place = matches[4];
                        cObj.isSpare = true;
                    } else {
                        const str = cInfo;
                        const matches = regexParser(regex, str);

                        cObj.course = matches[1];
                        cObj.section = matches[2];
                        cObj.place = matches[4];
                        cObj.isSpare = false;
                    }

                    days.push(cObj);
                } else if (!$(td).is('[style]')) {
                    days.push(null);
                }
            }
        });
        hours.push(days);
    });

    const week = {};
    week.monday = [];
    week.tuesday = [];
    week.wednesday = [];
    week.thursday = [];
    week.friday = [];
    week.saturday = [];
    week.sunday = [];

    for (let i = 0; i < hours.length; i++) {
        for (let j = 0; j < hours[0].length; j++) {
            if (hours[i][j] !== null) {
                hours[i][j].time = list[i].replace('  ', ' - ');
                if (j === 0) {
                    week.monday.push(hours[i][j]);
                } else if (j === 1) {
                    week.tuesday.push(hours[i][j]);
                } else if (j === 2) {
                    week.wednesday.push(hours[i][j]);
                } else if (j === 3) {
                    week.thursday.push(hours[i][j]);
                } else if (j === 4) {
                    week.friday.push(hours[i][j]);
                } else if (j === 5) {
                    week.saturday.push(hours[i][j]);
                } else if (j === 6) {
                    week.sunday.push(hours[i][j]);
                }
            }
        }
    }

    return week;
}

async function getSchedule(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/printableSchedule.php',
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

module.exports.get = getSchedule;
