module.exports = (regex, str) => {
    const result = [];
    let m;

    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            result.push(match);
        });
    }

    return result;
};
