import { Resend } from "resend";

const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

export const sendContactNotification = async (contact) => {
  try {
    const { RESEND_API_KEY, EMAIL_FROM, CONTACT_NOTIFICATION_EMAIL } =
      process.env;

    if (!RESEND_API_KEY || !EMAIL_FROM || !CONTACT_NOTIFICATION_EMAIL) {
      console.warn("Email notification skipped: Missing configuration.");
      return false;
    }

    const resend = new Resend(RESEND_API_KEY);

    const name = escapeHtml(contact.name);
    const email = escapeHtml(contact.email);
    const subject = escapeHtml(contact.subject);
    const message = escapeHtml(contact.message).replace(/\n/g, "<br>");

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [CONTACT_NOTIFICATION_EMAIL],
      subject: `New Portfolio Message: ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
            
            <div style="background: #111b32; padding: 25px; color: #ffffff;">
              <h2 style="margin: 0;">SALMAN FARSHI.</h2>
              <p style="color: #22d3ee; margin-bottom: 0;">
                New Portfolio Contact Message
              </p>
            </div>

            <div style="padding: 25px; color: #26334d;">
              <h3>New Message Received!</h3>

              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>

              <div style="background: #f4f6fb; padding: 18px; border-radius: 8px; margin-top: 20px;">
                <strong>Message:</strong>
                <p style="line-height: 1.7;">${message}</p>
              </div>

              <p style="margin-top: 25px; color: #64748b; font-size: 13px;">
                This notification was sent automatically by your portfolio website.
              </p>
            </div>

          </div>
        </div>
      `,
      text: `
New Portfolio Contact Message

Name: ${contact.name}
Email: ${contact.email}
Subject: ${contact.subject}

Message:
${contact.message}
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error.message);
      return false;
    }

    console.log("Contact notification email sent:", data?.id);

    return true;
  } catch (error) {
    console.error("Email Service Error:", error.message);
    return false;
  }
};
