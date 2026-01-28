require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function test() {
  try {
    console.log('📧 Test email...');
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Test Eluxtan',
      text: 'Ça marche! ✅'
    });
    console.log('✅ Email envoyé!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
