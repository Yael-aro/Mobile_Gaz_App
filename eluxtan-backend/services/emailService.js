const nodemailer = require('nodemailer');

// Configuration du transporteur email
// Pour la production, utilise un service comme SendGrid, Mailgun, ou Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // Email de l'entreprise Eluxtan
    pass: process.env.SMTP_PASS  // Mot de passe ou App Password
  }
});

// Email d'invitation pour nouveau client
const sendClientInvitation = async (clientData) => {
  const { email, name, tempPassword, resetLink } = clientData;

  const mailOptions = {
    from: `"Eluxtan" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🎉 Bienvenue chez Eluxtan - Activez votre compte',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue chez Eluxtan!</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Nous sommes ravis de vous accueillir en tant que nouveau client Eluxtan. Votre compte a été créé avec succès!</p>
            
            <div class="credentials">
              <h3>Vos identifiants de connexion:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mot de passe temporaire:</strong> <code>${tempPassword}</code></p>
            </div>
            
            <p>⚠️ <strong>Important:</strong> Pour des raisons de sécurité, vous devez changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="${resetLink}" class="button">Activer mon compte et changer le mot de passe</a>
            
            <p>Ou copiez ce lien dans votre navigateur:</p>
            <p style="background: white; padding: 10px; word-break: break-all;">${resetLink}</p>
            
            <h3>Que faire ensuite?</h3>
            <ol>
              <li>Cliquez sur le lien ci-dessus</li>
              <li>Connectez-vous avec vos identifiants temporaires</li>
              <li>Changez votre mot de passe</li>
              <li>Commencez à utiliser votre espace client!</li>
            </ol>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br><strong>L'équipe Eluxtan</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Eluxtan - Tous droits réservés</p>
            <p>Si vous n'avez pas demandé ce compte, veuillez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email d\'invitation envoyé à:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

// Email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"Eluxtan" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe Eluxtan',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            
            <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            
            <p>Ce lien est valide pendant 1 heure.</p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            
            <p>Cordialement,<br><strong>L'équipe Eluxtan</strong></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendClientInvitation,
  sendPasswordResetEmail
};
