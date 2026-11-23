import { Resend } from "resend";

export const sendPasswordResetEmail = async (admin, resetUrl) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!apiKey || !emailFrom) {
      console.error("Resend email configuration is missing.");
      return false;
    }

    // Initialize Resend only when sending an email
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: admin.email,
      subject: "Reset Your Admin Password",

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 30px; color: #1f2937;">
          <h2>Password Reset Request</h2>

          <p>Hello ${admin.name},</p>

          <p>
            We received a request to reset your admin account password.
            Click the button below to create a new password.
          </p>

          <a
            href="${resetUrl}"
            style="display: inline-block; padding: 13px 24px; background: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px;"
          >
            Reset Password
          </a>

          <p style="margin-top: 24px;">
            This link expires in 15 minutes.
          </p>

          <p>
            If you did not request this, you can safely ignore this email.
          </p>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

          <p style="font-size: 12px; color: #6b7280;">
            Salman Farshi Admin Dashboard
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Password Reset Email Error:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Password Reset Email Error:", error.message);
    return false;
  }
};
