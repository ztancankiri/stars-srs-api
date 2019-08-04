const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

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

async function parse(PHPSESSID, data) {
    const $ = cheerio.load(data);

    const letterGradeStat = {};

    const letterGradeTable = $('#letterGrade');

    const tds = $(letterGradeTable).find('tr > td');

    const labels = ['courseCode', 'courseNo', 'courseName', 'grade', 'graphID'];
    const semesterArray = [];
    let semester = {};
    let counter = 0;
    let course = {};

    for (let i = 0; i < tds.length; i++) {
        const element = $(tds.get(i));

        if (element.find('h4').length > 0) {
            semesterArray.push(semester);
            semester = {};
            semester.name = element.text().trim();
            semester.courses = [];
        } else {
            if (element.parent().hasClass('row1') || element.parent().hasClass('row2')) {
                if (counter % 5 == 0) {
                    course = {};
                } else if (counter % 5 == 4) {
                    semester.courses.push(course);
                }

                if (element.find('a').length == 0) {
                    course[labels[counter % 5]] = element.text().trim();
                } else {
                    course[labels[counter % 5]] = element.find('a').attr('data');
                }
                counter++;
            }
        }
    }

    semesterArray.shift();
    letterGradeStat.letterGradeStats = semesterArray;
    return letterGradeStat;
}

async function getLetterGrade(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/stats/letter-grade.php',
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

module.exports.get = getLetterGrade;
