const config = require('./config');
const rec = require('./mailReceiver')(config);
const codeExtractor = require('./codeExtractor');

rec.then(data => {
    console.log(codeExtractor(data.text));
}).catch(err => {
    console.log(err);
});
