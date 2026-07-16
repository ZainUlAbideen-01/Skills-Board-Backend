import nodemailer from 'nodemailer';
import env from './env';
import dns from 'dns';

// Fix for Render/Node 18+ where IPv6 connection to Gmail SMTP fails with ENETUNREACH
// We override dns.lookup to strictly return IPv4 addresses.
const originalLookup = dns.lookup;
(dns as any).lookup = function (domain: string, options: any, callback: any) {
    if (typeof options === 'function') {
        callback = options;
        options = { family: 4 };
    } else if (typeof options === 'object') {
        options = { ...options, family: 4 };
    } else {
        options = { family: 4 };
    }
    return (originalLookup as any).call(this, domain, options, callback);
};

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465, // true for 465, false for 587
    debug: true,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
});

dns.lookup(env.MAIL_HOST, { all: true }, (err, addresses) => {
    console.log(addresses);
});
export default transporter;