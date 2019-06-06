module.exports = string => {
    const regex = /coded ([A-Z]+).|[0-9]+/g;

    const result = {};
    let m;
    let i = 0;
    while ((m = regex.exec(string)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            if (i === 0 && groupIndex === 0) {
                result.code = match;
            } else if (i === 1 && groupIndex === 1) {
                result.ref = match;
            }
        });
        i++;
    }
    return result;
};
