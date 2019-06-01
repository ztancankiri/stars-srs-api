const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;

module.exports.receive = (config, reference) => {
    return new Promise(function(resolve, reject) {
        const imap = new Imap(config);

        imap.once('ready', () => {
            imap.openBox('INBOX', false, err => {
                if (err) reject(err);

                imap.search([['UNSEEN'], ['HEADER', 'SUBJECT', 'Secure Login Gateway E-Mail Verification Code']], (err, results) => {
                    if (err) reject(err);

                    try {
                        const f = imap.fetch(results, { bodies: '' });

                        imap.setFlags(results, ['\\SEEN'], err => {
                            if (err) reject(err);
                        });

                        imap.move(results, 'Trash');

                        f.on('message', msg => {
                            msg.on('body', stream => {
                                simpleParser(stream, (err, mail) => {
                                    if (mail.text.includes(reference)) {
                                        if (mail) resolve(mail);
                                        else reject(err);
                                    }
                                });
                            });
                        });

                        f.once('error', err => {
                            reject('Fetch error: ' + err);
                        });

                        f.once('end', () => {
                            imap.end();
                        });
                    } catch (e) {
                        reject('Exception: ' + e);
                    }
                });
            });
        });

        imap.once('error', function(err) {
            reject(err);
        });

        imap.connect();
    });
};
