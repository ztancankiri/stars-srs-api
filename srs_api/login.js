const request = require('request-promise');
const cheerio = require('cheerio');
const config = require('./config');
const rec = require('./mailReceiver');
const codeExtractor = require('./codeExtractor');

const j = request.jar();
rp = request.defaults({ jar: j });

async function getLogin() {
    const result = {};

    const options = {
        method: 'GET',
        url: 'https://stars.bilkent.edu.tr/srs/',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true
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

async function postLogin(url, data) {
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true,
        form: data
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

async function verifyEmail(data) {
    const options = {
        method: 'POST',
        url: 'https://stars.bilkent.edu.tr/accounts/site/verifyEmail',
        headers: {
            Host: 'stars.bilkent.edu.tr',
            Connection: 'keep-alive',
            Origin: 'https://stars.bilkent.edu.tr',
            Referer: 'https://stars.bilkent.edu.tr/accounts/site/verifyEmail',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        },
        transform: body => {
            return cheerio.load(body);
        },
        followAllRedirects: true,
        form: data
    };

    await rp(options)
        .then($ => {
            console.log($('title').html());
        })
        .catch(err => {
            console.log(err);
        });
}

async function login() {
    const formData = await getLogin();
    const form = {};

    form[formData.usernameField] = config.srs_username;
    form[formData.passwordField] = config.srs_password;
    form[formData.hiddenField] = '';
    for (let i = 0; i < form[formData.passwordField].length; i++) form[formData.hiddenField] += '*';
    form[formData.buttonField] = '';

    const url = 'https://stars.bilkent.edu.tr' + formData.actionURL;
    const refObj = await postLogin(url, form);

    console.log(refObj);
    const codeData = await rec.receive(config, refObj.ref);
    const codeObj = codeExtractor(codeData.text);

    const emailData = {};

    emailData['EmailVerifyForm[verifyCode]'] = codeObj.code;
    emailData.yt0 = '';

    await verifyEmail(emailData);
}

function getSession() {
    return rp;
}

module.exports = { login, getSession };
