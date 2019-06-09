const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');
const regexParser = require('../util/regexParser');

async function getInstructorEMail(id, PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/instructor.sendMail.php?ID=' + id,
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

    const data = await rp(options);
    const $ = cheerio.load(data);
    const email = $("input[name='EMAIL']");
    result = email.attr('value');

    return result;
}

async function parse(data, PHPSESSID) {
    const $ = cheerio.load(data);

    const table = $('#coursesMenu');
    const caption = $(table)
        .find('caption')
        .text();

    const tbody = $(table).find('tbody');
    const trs = $(tbody).find('tr');

    const courses = {};
    const enrolled = [];

    const instructorIDs = [];

    trs.each((i, tr) => {
        const tds = $(tr).find('td');

        const elink = $(tds[2])
            .find('a')
            .attr('href');

        const regex = /ID=([0-9]+)&NAME/gm;
        const matches = regexParser(regex, elink);

        instructorIDs.push(matches[1]);
    });

    const instructorLinks = [];
    for (let i = 0; i < instructorIDs.length; i++) {
        instructorLinks.push(await getInstructorEMail(instructorIDs[i], PHPSESSID));
    }

    await trs.each(async (i, tr) => {
        const tds = $(tr).find('td');

        const course = {};
        course.code = $(tds[0]).text();
        course.name = $(tds[1]).text();

        course.instructor = {};
        course.instructor.name = $(tds[2])
            .text()
            .trim();

        course.instructor.email = instructorLinks[i];

        course.credits = {};
        course.credits.bilkent = parseInt($(tds[3]).text());
        course.credits.ects = parseInt($(tds[4]).text());
        course.type = $(tds[5]).text();
        course.loadingModule = $(tds[6]).text();

        const links = $(tds[7]).find('a');
        course.syllabus = 'https://stars.bilkent.edu.tr/' + $(links[2]).attr('href');

        enrolled.push(course);
    });

    courses.enrolled = enrolled;
    courses.title = caption;

    return courses;
}

async function getCourses(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/courses.php',
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

module.exports.get = getCourses;
