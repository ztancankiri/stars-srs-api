const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

function parse(data) {
    const courses = [];

    const $ = cheerio.load(data);

    const gradeDiv = $('div[class=gradeDiv]');

    gradeDiv.each((i, element) => {
        const course = {};

        const h4 = $(element)
            .find('h4')
            .text()
            .trim()
            .substr(18);

        course.name = h4;

        const tbody = $(element).find('div > table > tbody');
        const trs = tbody.find('tr');

        const grades = [];

        trs.each((j, tr) => {
            if (j !== 0) {
                const nrCol = $(tr).children().length;
                if (nrCol > 1) {
                    const tdObj = {};
                    const tds = $(tr).find('td');
                    tds.each((k, td) => {
                        switch (k) {
                            case 0:
                                tdObj.title = $(td).text();
                                break;
                            case 1:
                                tdObj.type = $(td).text();
                                break;
                            case 2:
                                tdObj.date = $(td).text();
                                break;
                            case 3:
                                tdObj.grade = $(td)
                                    .text()
                                    .trim();
                                break;
                            case 4:
                                tdObj.comment = $(td).text();
                                break;
                            default:
                                break;
                        }
                    });
                    grades.push(tdObj);
                }
            }
        });

        course.grades = grades;
        courses.push(course);
    });

    return courses;
}

async function getGrades(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/gradeAndAttend/grade.php?noinfo=y',
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

module.exports.get = getGrades;
