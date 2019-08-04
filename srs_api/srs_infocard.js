const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const config = require('../config');

async function parse(PHPSESSID, data) {
    const $ = cheerio.load(data);

    const info = {};

    const infoTables = $("table[class='standard']");

    const studentInfo = $(infoTables[0]);
    const advisorInfo = $(infoTables[1]);
    const academicInfo = $(infoTables[2]);
    const scholarshipInfo = $(infoTables[3]);
    const contactInfo = $(infoTables[4]);
    const identityInfo = $(infoTables[5]);
    const parentInfo = $(infoTables[6]);
    const addressInfo = $(infoTables[7]);
    const prepInfo = $(infoTables[8]);
    const admissionInfo = $(infoTables[9]);
    const dormInfo = $(infoTables[10]);

    let tds = studentInfo.find('tr > td:not([width])');
    info.studentInfo = {};
    info.studentInfo.studentID = $(tds.get(0))
        .text()
        .trim();
    info.studentInfo.nationalID = $(tds.get(1))
        .text()
        .trim();
    info.studentInfo.name = $(tds.get(2))
        .text()
        .trim();
    info.studentInfo.currentStatus = $(tds.get(3))
        .text()
        .trim();
    info.studentInfo.faculty = $(tds.get(4))
        .text()
        .trim();
    info.studentInfo.department = $(tds.get(5))
        .text()
        .trim();

    //-------------------------------------------------

    tds = advisorInfo.find('tr > td:not([width])');
    info.advisorInfo = {};
    info.advisorInfo.name = $(tds.get(0))
        .text()
        .trim();
    info.advisorInfo.email = $(tds.get(1))
        .text()
        .trim();
    info.advisorInfo.phone = $(tds.get(2))
        .text()
        .trim();
    info.advisorInfo.office = $(tds.get(3))
        .text()
        .trim();

    //-------------------------------------------------

    tds = academicInfo.find('tr > td:not([style])');
    info.academicInfo = {};
    info.academicInfo.standing = $(tds.get(0))
        .text()
        .trim();
    info.academicInfo.GPA = $(tds.get(1))
        .text()
        .trim();
    info.academicInfo.CGPA = $(tds.get(2))
        .text()
        .trim();
    info.academicInfo.prepSemesterCount = $(tds.get(3))
        .text()
        .trim();
    info.academicInfo.registrationSemester = $(tds.get(4))
        .text()
        .trim();
    info.academicInfo.curriculumSemester = $(tds.get(5))
        .text()
        .trim();
    info.academicInfo.class = $(tds.get(6))
        .text()
        .trim();
    info.academicInfo.nominalCreditLoad = $(tds.get(7))
        .text()
        .trim();
    info.academicInfo.courseLoadLowerLimit = $(tds.get(8))
        .text()
        .trim();
    info.academicInfo.courseLoadUpperLimit = $(tds.get(9))
        .text()
        .trim();
    info.academicInfo.cohort = $(tds.get(10))
        .text()
        .trim();
    info.academicInfo.agpa = $(tds.get(11))
        .text()
        .trim();
    info.academicInfo.rankOrder = $(tds.get(12))
        .text()
        .trim();

    //-------------------------------------------------

    tds = scholarshipInfo.find('tr > td');
    info.scholarshipInfo = {};
    info.scholarshipInfo.osym = $(tds.get(0))
        .text()
        .trim();
    info.scholarshipInfo.merit = $(tds.get(1))
        .text()
        .trim();

    //-------------------------------------------------

    tds = contactInfo.find('tr > td');
    info.contactInfo = {};
    info.contactInfo.contactEmail = $(tds.get(0))
        .text()
        .trim();
    info.contactInfo.bilkentEmail = $(tds.get(1))
        .text()
        .trim();
    info.contactInfo.phone = $(tds.get(2))
        .text()
        .trim();
    info.contactInfo.mobilePhone = $(tds.get(3))
        .text()
        .trim();

    //-------------------------------------------------

    tds = identityInfo.find('tr > td');
    info.identityInfo = {};
    info.identityInfo.idNo = $(tds.get(0))
        .text()
        .trim();
    info.identityInfo.city = $(tds.get(1))
        .text()
        .trim();
    info.identityInfo.county = $(tds.get(2))
        .text()
        .trim();
    info.identityInfo.districtVillage = $(tds.get(3))
        .text()
        .trim();
    info.identityInfo.volume = $(tds.get(4))
        .text()
        .split('-')[0]
        .trim();
    info.identityInfo.page = $(tds.get(4))
        .text()
        .split('-')[1]
        .trim();
    info.identityInfo.section = $(tds.get(4))
        .text()
        .split('-')[2]
        .trim();
    info.identityInfo.birthDate = $(tds.get(5))
        .text()
        .split('-')[0]
        .trim();
    info.identityInfo.birthPlace = $(tds.get(5))
        .text()
        .split('-')[1]
        .trim();
    info.identityInfo.maritalStatus = $(tds.get(6))
        .text()
        .trim();
    info.identityInfo.gender = $(tds.get(7))
        .text()
        .trim();

    //-------------------------------------------------

    tds = parentInfo.find('tr > td');
    info.parentInfo = {};
    info.parentInfo.motherName = $(tds.get(0))
        .text()
        .trim();
    info.parentInfo.motherLastName = $(tds.get(1))
        .text()
        .trim();
    info.parentInfo.motherPhone = $(tds.get(2))
        .text()
        .trim();
    info.parentInfo.motherOccupation = $(tds.get(3))
        .text()
        .trim();
    info.parentInfo.fatherName = $(tds.get(4))
        .text()
        .trim();
    info.parentInfo.fatherLastName = $(tds.get(5))
        .text()
        .trim();
    info.parentInfo.fatherPhone = $(tds.get(6))
        .text()
        .trim();
    info.parentInfo.fatherOccupation = $(tds.get(7))
        .text()
        .trim();
    info.parentInfo.constactPerson = $(tds.get(8))
        .text()
        .trim();

    //-------------------------------------------------

    tds = addressInfo.find('tr > td');
    info.addressInfo = {};
    info.addressInfo.activeAddress = $(tds.get(0))
        .text()
        .trim();

    //-------------------------------------------------

    tds = prepInfo.find('tr > td');
    info.prepInfo = {};
    info.prepInfo.prepType = $(tds.get(0))
        .text()
        .trim();
    info.prepInfo.examName = $(tds.get(1))
        .text()
        .trim();
    info.prepInfo.examDate = $(tds.get(2))
        .text()
        .trim();
    info.prepInfo.grade = $(tds.get(3))
        .text()
        .trim();

    //-------------------------------------------------

    tds = admissionInfo.find('tr > td');
    info.admissionInfo = {};
    info.admissionInfo.highSchool = $(tds.get(0))
        .text()
        .trim();

    //-------------------------------------------------

    tds = dormInfo.find('tr > td');
    info.dormInfo = {};
    info.dormInfo.dormName = $(tds.get(0))
        .text()
        .trim();
    info.dormInfo.roomNo = $(tds.get(1))
        .text()
        .trim();

    return info;
}

async function getInfoCard(PHPSESSID) {
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
        url: 'https://stars.bilkent.edu.tr/srs/ajax/infoCard.php',
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

module.exports.get = getInfoCard;
