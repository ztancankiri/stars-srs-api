const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

function parse(data) {
    const $ = cheerio.load(data);

    const divs = $("div[class='alert alert-info']");
    const withdraw_info = {};

    divs.each((i, div) => {
        const table = $(div).find('table');
        const tbody = $(table).find('tbody');
        const trs = $(tbody).find('tr');

        trs.each((j, tr) => {
            const tds = $(tr).find('td');
            tds.each((k, td) => {
                if (i === 0) {
                    if (k === 1) {
                        if (j === 0) {
                            withdraw_info.limit = parseInt($(td).text());
                        } else if (j === 1) {
                            withdraw_info.used = parseInt($(td).text());
                        } else if (j === 2) {
                            withdraw_info.available = parseInt($(td).text());
                        }
                    }
                } else if (i === 1) {
                    if (k === 1) {
                        if (j === 0) {
                            withdraw_info.start_date = $(td).text();
                        } else if (j === 1) {
                            withdraw_info.end_date = $(td).text();
                        }
                    }
                }
            });
        });
    });

    return { withdraw_info };
}

async function getWInfo(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs-v2/withdraw/course/',
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

module.exports.get = getWInfo;
