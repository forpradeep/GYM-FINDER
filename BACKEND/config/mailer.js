const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    await transporter.sendMail({
        from: `"GymFinder" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'GymFinder — Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff; border-radius: 12px;">
                <h2 style="color: #D4AF37; text-align: center;">GymFinder</h2>
                <p style="text-align: center; color: #9ca3af;">Your verification code is:</p>
                <div style="background: #1a1a1a; border: 1px solid #D4AF37; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #D4AF37; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
                </div>
                <p style="color: #9ca3af; text-align: center; font-size: 12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
            </div>
        `
    })
}

module.exports = { sendOTP }