import nodemailer from 'nodemailer';
import env from './env';
import dns from 'dns';

// Fix for Render/Node 18+ where IPv6 connection to Gmail SMTP fails with ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465, // true for 465, false for 587
    debug: true,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
    tls: {
    },
    ...({ family: 4 } as any),
});

dns.lookup(env.MAIL_HOST, { all: true }, (err, addresses) => {
    console.log(addresses);
});
export default transporter;