const nodemailer = require("nodemailer");
const config = require("../config/mailer.config");

// Validate required configuration
if (!config.email || !config.password) {
  console.error(
    "Missing email configuration. Please set EMAIL_USER and EMAIL_PASS environment variables."
  );
}

const transporter = nodemailer.createTransport({
  service: config.service || "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

// Verify transporter configuration
transporter
  .verify()
  .then(() => console.log("Mailer service is ready"))
  .catch((err) => console.error("Mailer service configuration error:", err));

class MailerError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "MailerError";
    this.details = details;
    this.status = 500;
  }
}

// Build professional HTML email (table-based, inline CSS)
function buildEmailHTML({ businessName, merchantFormURL, logoUrl }) {
  const safeName = businessName || "your business";
  const preheader = `Complete your ZifyPay merchant application for ${safeName}.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Complete Your Merchant Application</title>
<style>
  /* Dark mode friendly defaults (some clients respect these) */
  @media (prefers-color-scheme: dark) {
    .bg { background-color: #0f172a !important; }
    .card { background-color: #111827 !important; color: #e5e7eb !important; }
    .muted { color: #9ca3af !important; }
    .btn { background-color: #2563eb !important; }
  }
  a { text-decoration: none; }
</style>
</head>
<body style="margin:0; padding:0; background:#f5f7fb;" class="bg">
  <!-- Preheader (hidden) -->
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">
    ${preheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:12px 0 20px;">
              <img src="${logoUrl}" alt="ZifyPay" width="140" height="40" style="display:block; width:140px; height:auto;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="card" style="background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 16px rgba(22,24,28,0.06); font-family:Inter,Segoe UI,Arial,sans-serif; color:#111827;">
              <h1 style="margin:0 0 8px; font-size:22px; line-height:1.3; font-weight:700;">Complete Your Merchant Application</h1>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                Hi from the ZifyPay Team 👋
              </p>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                Your application for <strong>${safeName}</strong> has been created.
                Please click the button below to securely finish your merchant onboarding.
              </p>

              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center" bgcolor="#2563eb" class="btn" style="border-radius:8px;">
                    <a href="${merchantFormURL}"
                       style="display:inline-block; padding:12px 22px; font-size:15px; font-weight:600; color:#ffffff; background:#2563eb; border-radius:8px;">
                      📝 Complete Application
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p class="muted" style="margin:0 0 10px; font-size:13px; line-height:1.6; color:#6b7280;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 16px; font-size:13px; line-height:1.6; background:#f3f4f6; padding:10px; border-radius:8px; word-break:break-all;">
                <a href="${merchantFormURL}" style="color:#2563eb;">${merchantFormURL}</a>
              </p>

              <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">
                Need help? Just reply to this email—our team is here for you.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 8px;">
              <p class="muted" style="margin:8px 0 0; font-family:Inter,Segoe UI,Arial,sans-serif; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} ZifyPay. All rights reserved.
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

function buildTextFallback({ businessName, merchantFormURL }) {
  const safeName = businessName || "your business";
  return `Complete Your Merchant Application

Hi from the ZifyPay Team 👋

Your application for ${safeName} has been created.
Please open the link below to complete your merchant onboarding:

${merchantFormURL}

If you need help, just reply to this email.

— ZifyPay Team`;
}

exports.sendMerchantDetails = async (email, externalKey, businessName) => {
  // Input validation
  if (!email) {
    throw new MailerError("Email address is required", { field: "email" });
  }
  if (!externalKey) {
    throw new MailerError("External key is required", { field: "externalKey" });
  }
  if (!config.frontendUrl) {
    throw new MailerError("Frontend URL is not configured", {
      config: "FRONTEND_URL",
    });
  }

  const merchantFormURL = `${
    config.frontendUrl
  }/merchant-form?key=${encodeURIComponent(externalKey)}`;
  const logoUrl = config.logoUrl || "https://zifypay.com/logo.png";

  const subject = "Complete Your Merchant Application";
  const html = buildEmailHTML({ businessName, merchantFormURL, logoUrl });
  const text = buildTextFallback({ businessName, merchantFormURL });

  const mailOptions = {
    from: `"ZifyPay Onboarding" <${config.email}>`,
    to: email,
    subject,
    html,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, email, externalKey };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new MailerError("Failed to send merchant email", {
      originalError: error.message,
      email,
      externalKey,
    });
  }
};
