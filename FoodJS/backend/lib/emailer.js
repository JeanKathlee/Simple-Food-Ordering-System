const nodemailer = require('nodemailer');

function parseBool(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

async function sendStatusEmail({ to, subject, text }) {
  const transporter = buildTransport();

  if (!transporter) {
    console.warn('SMTP not configured. Skipping email send.');
    return { skipped: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const message = {
    from,
    to,
    subject,
    text,
  };

  const info = await transporter.sendMail(message);
  return { skipped: false, messageId: info.messageId };
}

module.exports = {
  sendStatusEmail,
};
