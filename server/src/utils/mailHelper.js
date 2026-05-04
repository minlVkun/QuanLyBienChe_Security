/**
 * Mock Mail Helper
 * In production, use nodemailer with SMTP config.
 */
const mailHelper = {
    async sendResetPasswordEmail(email, token) {
        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        
        console.log('--------------------------------------------');
        console.log(`SENDING EMAIL TO: ${email}`);
        console.log(`SUBJECT: Reset Your Password`);
        console.log(`BODY: Click here to reset your password: ${resetLink}`);
        console.log('--------------------------------------------');
        
        return true;
    }
};

module.exports = mailHelper;
