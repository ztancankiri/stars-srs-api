const rp = require('request-promise');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const config = require('../config');

iconv.skipDecodeWarning = true;

function parseNutrition(str) {
    const regex = /Enerji \(k\.cal\.\) \/ Energy \(Cal\.\):\s+([0-9]+)\s+Karbonhidrat \/ Carbohydrate: %([0-9]+)\s+Protein \/ Protein: %([0-9]+)\s+Yağ \/ Fat:%([0-9]+)/gm;
    const obj = {};

    let m;
    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
                obj.energy = parseInt(match);
            } else if (groupIndex === 2) {
                obj.carb = parseInt(match);
            } else if (groupIndex === 3) {
                obj.protein = parseInt(match);
            } else if (groupIndex === 4) {
                obj.fat = parseInt(match);
            }
        });
    }

    return obj;
}

function parseMeal(str) {
    str = str.replace(' veya / or ', ' ');
    const arr = [];
    let waitForCapital = 0;
    let buffer = '';
    let pflag = true;

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            pflag = false;
        } else if (str[i] === ')') {
            pflag = true;
        }

        if (pflag) {
            if (str[i] === '/' && waitForCapital === 0) {
                waitForCapital = 1;
            } else if (str[i] === str[i].toUpperCase() && str[i].match(/[A-ZĞÜŞİÖÇ]/i) && waitForCapital === 1) {
                waitForCapital++;
            } else if (str[i] === str[i].toUpperCase() && str[i].match(/[A-ZĞÜŞİÖÇ]/i) && waitForCapital === 2) {
                waitForCapital = 0;
                arr.push(buffer.trim());
                buffer = '';
            }
        }

        buffer += str[i].replace(/\u0092/g, "'");
    }

    arr.push(buffer.trim());

    return arr;
}

function parse(data) {
    const $ = cheerio.load(data);

    const tableFix = $("table[cellpadding='2']");
    const tbodyFix = $(tableFix).find('tbody');
    const trsFix = tbodyFix.find('tr');

    const tableAlt = $("table[cellpadding='3']");
    const tbodyAlt = $(tableAlt).find('tbody');
    const trsAlt = tbodyAlt.find('tr');

    const tableTitle = $("table[class='icerik']");
    const tbodyTitle = $(tableTitle).find('tbody');
    const trsTitle = $(tbodyTitle).find('tr');
    const tdsTitle = $(trsTitle[1]).find('td');
    const psTitle = $(tdsTitle[0]).find('p');
    const title = $(psTitle[3])
        .text()
        .trim()
        .replace(/\t/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');

    const meals = {};
    meals.range = title;
    meals.fix = [];
    meals.alternative = [];

    trsFix.each((i, tr) => {
        if (i !== 0) {
            const tds = $(tr).find('td');

            if (tds.length === 3) {
                const day_parts = $(tds[0])
                    .text()
                    .trim()
                    .replace(/\t/g, '')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .split(' ');

                const meal = parseMeal(
                    $(tds[1])
                        .text()
                        .trim()
                        .replace(/\t/g, '')
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ')
                );
                const nutrition = parseNutrition($(tds[2]).text());

                const row = {};
                row.day = day_parts[0] + ' ' + day_parts[1] + ' / ' + day_parts[2];
                row.lunch = {};
                row.lunch.meal = {};
                row.lunch.meal.regular = meal[2];
                row.lunch.meal.vegetarian = meal[3];
                row.lunch.meal.others = [];
                for (let k = 4; k < meal.length; k++) row.lunch.meal.others.push(meal[k]);
                row.lunch.nutrition = nutrition;

                meals.fix.push(row);
            } else if (tds.length === 2) {
                const meal = parseMeal(
                    $(tds[0])
                        .text()
                        .trim()
                        .replace(/\t/g, '')
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ')
                );
                const nutrition = parseNutrition($(tds[1]).text());

                meals.fix[meals.fix.length - 1].dinner = {};
                meals.fix[meals.fix.length - 1].dinner.meal = {};
                meals.fix[meals.fix.length - 1].dinner.meal.regular = meal[2];
                meals.fix[meals.fix.length - 1].dinner.meal.vegetarian = meal[3];
                meals.fix[meals.fix.length - 1].dinner.meal.others = [];
                for (let k = 4; k < meal.length; k++) meals.fix[meals.fix.length - 1].dinner.meal.others.push(meal[k]);

                meals.fix[meals.fix.length - 1].dinner.nutrition = nutrition;
            }
        }
    });

    trsAlt.each((i, tr) => {
        if (i !== 0) {
            const tds = $(tr).find('td');

            const day_parts = $(tds[0])
                .text()
                .trim()
                .replace(/\t/g, '')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .split(' ');

            const meal = parseMeal(
                $(tds[1])
                    .text()
                    .trim()
                    .replace(/\t/g, '')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
            );

            const row = {};
            row.day = day_parts[0] + ' ' + day_parts[1] + ' / ' + day_parts[2];
            row.meal = meal;

            meals.alternative.push(row);
        }
    });

    return meals;
}

async function getFood() {
    let result;

    const options = {
        method: 'GET',
        url: 'http://www.bilkent.edu.tr/~kafemud/monu_tr.html',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            'User-Agent': config.user_agent
        },
        followAllRedirects: true,
        encoding: 'latin1'
    };

    await rp(options)
        .then(data => {
            data = iconv.decode(data, 'ISO-8859-9');
            result = parse(data);
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

module.exports.get = getFood;
