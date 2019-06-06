const rp = require('request-promise');
const cheerio = require('cheerio');
const config = require('../config');
const rec = require('../util/mailReceiver');
const codeExtractor = require('../util/codeExtractor');

async function getLogin(cookieJar) {
    const result = {};

    const options = {
        method: 'GET',
        url: 'https://stars.bilkent.edu.tr/srs/',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            'User-Agent': config.user_agent
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true,
        jar: cookieJar
    };

    await rp(options)
        .then($ => {
            console.log($('title').html());
            result.actionURL = $("form[method='post']").attr('action');
            result.usernameField = 'LoginForm[username]';
            result.passwordField = 'LoginForm[password]';
            result.hiddenField = $('.controls').find('input')[1].attribs.name;
            result.buttonField = 'yt0';
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

async function postLogin(cookieJar, url, data) {
    const result = {};

    const options = {
        method: 'POST',
        url: url,
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/accounts/login/',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': config.user_agent
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true,
        form: data,
        jar: cookieJar
    };

    await rp(options)
        .then($ => {
            console.log($('title').html());
            result.ref = $('strong').text();
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

async function verifyEmail(cookieJar, data) {
    const options = {
        method: 'POST',
        url: 'https://stars.bilkent.edu.tr/accounts/site/verifyEmail',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/accounts/site/verifyEmail',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': config.user_agent
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true,
        form: data,
        jar: cookieJar
    };

    await rp(options)
        .then($ => {
            console.log($('title').html());
        })
        .catch(err => {
            console.log(err);
        });
}

function getPHPSESSID(cookieJar) {
    const regex = /PHPSESSID=([A-Za-z0-9]+);/gm;
    const str = cookieJar._jar.store.idx['stars.bilkent.edu.tr']['/'].PHPSESSID.toString();

    let m, cookie;

    let loopBreaker = false;
    while ((m = regex.exec(str)) !== null && !loopBreaker) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            if (groupIndex == 1) {
                cookie = match;
                loopBreaker = true;
            }
        });
    }

    return cookie;
}

async function login(credentials) {
    const cookieJar = rp.jar();

    const formData = await getLogin(cookieJar);
    const form = {};

    config.user = credentials.email_username;
    config.password = credentials.email_password;
    config.srs_username = credentials.srs_username;
    config.srs_password = credentials.srs_password;

    form[formData.usernameField] = config.srs_username;
    form[formData.passwordField] = config.srs_password;
    form[formData.hiddenField] = '';
    for (let i = 0; i < form[formData.passwordField].length; i++) form[formData.hiddenField] += '*';
    form[formData.buttonField] = '';

    const url = 'https://stars.bilkent.edu.tr' + formData.actionURL;
    const refObj = await postLogin(cookieJar, url, form);

    console.log(refObj);
    const codeData = await rec.receive(config, refObj.ref);
    const codeObj = codeExtractor(codeData.text);

    const emailData = {};

    emailData['EmailVerifyForm[verifyCode]'] = codeObj.code;
    emailData.yt0 = '';

    await verifyEmail(cookieJar, emailData);
    return getPHPSESSID(cookieJar);
}

module.exports = { login };
