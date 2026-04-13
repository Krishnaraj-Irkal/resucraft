import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for port 465, false for 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a verification email with a one-time link.
 * @param {string} toEmail - Recipient email address
 * @param {string} token   - Raw verification token
 */
export const sendVerificationEmail = async (toEmail, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"AI Resume Builder" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Verify your email address',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                <h2>Welcome to AI Resume Builder!</h2>
                <p>Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
                <a href="${verifyUrl}"
                   style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
                    Verify Email
                </a>
                <p style="margin-top:16px;color:#6b7280;font-size:13px">
                    Or copy this link into your browser:<br/>
                    <span style="color:#4f46e5">${verifyUrl}</span>
                </p>
                <p style="color:#6b7280;font-size:12px">If you didn't create an account, you can safely ignore this email.</p>
            </div>
        `,
    });
};
