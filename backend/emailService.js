// ============================================
// EMAIL SERVICE — Google Apps Script API
// ============================================

// Pull the Webhook URL from the environment variables (no hardcoding)
const EMAIL_API_URL = process.env.EMAIL_API_URL;

function buildResetEmailHTML(userName, resetURL) {
    // ... keep your exact same HTML template code here ...
}

async function sendPasswordResetEmail(user, resetToken) {
    const resetURL = `https://virajj12.github.io/College-Connect/reset.html?token=${resetToken}`;

    if (!EMAIL_API_URL) {
        console.warn('⚠️ EMAIL_API_URL is missing in .env! Printing reset link to console instead.');
        console.log(`[DEV MODE] Reset Link: ${resetURL}`);
        return;
    }

    try {
        const response = await fetch(EMAIL_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                to: user.email,
                subject: 'Password Reset — College Connect',
                html: buildResetEmailHTML(user.name, resetURL)
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        console.log(`📧 Password reset email requested for ${user.email}`);
    } catch (err) {
        console.error('❌ Failed to trigger email API:', err.message);
        throw new Error('Failed to send password reset email');
    }
}

module.exports = { sendPasswordResetEmail };

// --- HTML Email Template ---
function buildResetEmailHTML(userName, resetURL) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 36px 24px; text-align: center;">
                            <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 800; color: #6b9bff; letter-spacing: -0.5px;">
                                College Connect
                            </h1>
                            <p style="margin: 0; font-size: 14px; color: rgba(240, 244, 248, 0.6); font-weight: 500; letter-spacing: 0.5px;">
                                Password Reset Request
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 36px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(107, 155, 255, 0.3), transparent);"></div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 28px 36px;">
                            <p style="margin: 0 0 16px; font-size: 16px; color: rgba(240, 244, 248, 0.9); line-height: 1.6;">
                                Hi <strong style="color: #f0f4f8;">${userName}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 15px; color: rgba(240, 244, 248, 0.7); line-height: 1.7;">
                                We received a request to reset your password. Click the button below to set a new password:
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0 28px;">
                                        <a href="${resetURL}" target="_blank" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6b9bff, #3b6ccc); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px; letter-spacing: 0.3px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiry Warning -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 10px;">
                                <tr>
                                    <td style="padding: 14px 18px;">
                                        <p style="margin: 0; font-size: 13px; color: rgba(245, 158, 11, 0.9); line-height: 1.5;">
                                            ⏰ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 0 36px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 36px 32px; text-align: center;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: rgba(240, 244, 248, 0.3);">
                                🔒 This is an automated message from College Connect.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: rgba(240, 244, 248, 0.25);">
                                Alva's Institute of Engineering & Technology
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// --- Send Password Reset Email ---
async function sendPasswordResetEmail(user, resetToken) {
    // Build the reset URL
    const resetURL = `https://virajj12.github.io/College-Connect/reset.html?token=${resetToken}`;

    if (resend) {
        // Production: send real email via Resend API
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'College Connect <onboarding@resend.dev>';

        try {
            const { data, error } = await resend.emails.send({
                from: fromAddress,
                to: [user.email],
                subject: 'Password Reset — College Connect',
                html: buildResetEmailHTML(user.name, resetURL)
            });

            if (error) {
                console.error('❌ Resend API error:', error);
                throw new Error('Failed to send password reset email');
            }

            console.log(`📧 Password reset email sent to ${user.email} (ID: ${data.id})`);
        } catch (err) {
            console.error('❌ Failed to send reset email:', err.message);
            throw new Error('Failed to send password reset email');
        }
    } else {
        // Dev fallback: log to console
        console.log(`\n======================================================`);
        console.log(`*** PASSWORD RESET TOKEN GENERATED FOR ${user.email} ***`);
        console.log(`*** DEVELOPMENT ONLY: Go to this URL to reset: ${resetURL}`);
        console.log(`======================================================\n`);
    }
}

module.exports = { sendPasswordResetEmail };
