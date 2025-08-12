const nodemailer = require("nodemailer");
const config = require("../config/mailer.config");

// transporter (unchanged)
const transporter = nodemailer.createTransporter({
  service: config.service || "gmail",
  auth: { user: config.email, pass: config.password },
});

class MailerError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "MailerError";
    this.details = details;
    this.status = 500;
  }
}

function buildEmailHTML({
  businessName,
  merchantFormURL,
  logoUrl,
  supportEmail,
}) {
  const safeName = businessName || "your business";
  const brand = {
    primary: "#2563EB",
    primaryDark: "#1E40AF",
    text: "#0F172A",
    muted: "#475569",
    bg: "#F4F6FA",
    card: "#FFFFFF",
    border: "#E5EAF2",
  };
  const preheader = `Finish onboarding for ${safeName} on ZifyPay.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>Complete Your Merchant Application</title>
</head>
<body style="margin:0; padding:0; background:${brand.bg};">
  <!-- Preheader (hidden) -->
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">
    ${preheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${
    brand.bg
  };">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%; max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background:${brand.card}; border:1px solid ${
    brand.border
  }; border-bottom:0; border-radius:12px 12px 0 0; padding:20px 24px;">
              <table role="presentation" width="100%">
                <tr>
                  <td align="left">
                    <!-- Logo with blue background box -->
                    <div style="display:inline-block; background:${
                      brand.primary
                    }; padding:12px 16px; border-radius:8px; box-shadow:0 2px 4px rgba(37, 99, 235, 0.1);">
                      <img src="${logoUrl}" alt="ZifyPay" width="160" style="display:block; width:160px; height:auto; filter:brightness(0) invert(1);"/>
                    </div>
                  </td>
                  <td align="right" style="font:500 14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                    brand.muted
                  };">
                    Merchant Onboarding
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background:${brand.card}; border:1px solid ${
    brand.border
  }; border-top:0; border-bottom:0; padding:28px 24px;">
              <h1 style="margin:0 0 6px; font:700 22px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                brand.text
              };">
                Complete Your Merchant Application
              </h1>
              <p style="margin:0 0 14px; font:400 15px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                brand.muted
              };">
                Hi from the ZifyPay Team 👋
              </p>
              <p style="margin:0 0 16px; font:400 15px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                brand.text
              };">
                Your application for <strong>${safeName}</strong> has been created. Click the button below to securely finish your onboarding.
              </p>

              <!-- Primary CTA: Bulletproof button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
                <tr>
                  <td align="center" style="border-radius:10px;" bgcolor="${
                    brand.primary
                  }">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${merchantFormURL}" style="height:44px; v-text-anchor:middle; width:260px;" arcsize="12%" stroke="f" fillcolor="${
    brand.primary
  }">
                      <w:anchorlock/>
                      <center style="color:#ffffff; font-family:Segoe UI, Arial, sans-serif; font-size:15px; font-weight:600;">
                        📝 Complete Application
                      </center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="${merchantFormURL}"
                      style="display:inline-block; padding:12px 22px; font:600 15px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:#ffffff; background:${
                        brand.primary
                      }; border-radius:10px; text-decoration:none;">
                      📝 Complete Application
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px;">
                <tr>
                  <td style="height:1px; line-height:1px; background:${
                    brand.border
                  };">&nbsp;</td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 8px; font:500 13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                brand.muted
              };">
                If the button doesn't work, copy this link:
              </p>
              <p style="margin:0; font:400 13px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                brand.primary
              }; word-break:break-all; background:#F8FAFF; padding:10px 12px; border:1px solid ${
    brand.border
  }; border-radius:8px;">
                <a href="${merchantFormURL}" style="color:${
    brand.primary
  }; text-decoration:none;">${merchantFormURL}</a>
              </p>
            </td>
          </tr>

          <!-- Help strip -->
          <tr>
            <td style="background:${brand.card}; border:1px solid ${
    brand.border
  }; border-top:0; border-bottom:0; padding:18px 24px;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:${
                    brand.muted
                  };">
                    Need help? Reply to this email or contact us at
                    <a href="mailto:${supportEmail}" style="color:${
    brand.primary
  }; text-decoration:none;">${supportEmail}</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${brand.card}; border:1px solid ${
    brand.border
  }; border-top:0; border-radius:0 0 12px 12px; padding:16px 24px;">
              <p style="margin:0; font:400 12px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:#94A3B8;">
                © ${new Date().getFullYear()} ZifyPay. All rights reserved.
              </p>
              <p style="margin:6px 0 0; font:400 11px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; color:#9CA3AF;">
                You're receiving this because an application was initiated for your business on ZifyPay. If this wasn't you, please ignore this email.
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

function buildTextFallback({ businessName, merchantFormURL, supportEmail }) {
  const safeName = businessName || "your business";
  return `Complete Your Merchant Application

Your application for ${safeName} has been created.
Open this link to complete onboarding:

${merchantFormURL}

Need help? Contact us at ${supportEmail}.
— ZifyPay Team`;
}

exports.sendMerchantDetails = async (email, externalKey, businessName) => {
  if (!email)
    throw new MailerError("Email address is required", { field: "email" });
  if (!externalKey)
    throw new MailerError("External key is required", { field: "externalKey" });
  if (!config.frontendUrl)
    throw new MailerError("Frontend URL is not configured", {
      config: "FRONTEND_URL",
    });

  const merchantFormURL = `${
    config.frontendUrl
  }/merchant-form?key=${encodeURIComponent(externalKey)}`;
  const logoUrl = config.logoUrl || "https://zifypay.com/logo.png";
  const supportEmail =
    config.supportEmail || config.email || "support@zifypay.com";

  const subject = "Complete Your Merchant Application";
  const html = buildEmailHTML({
    businessName,
    merchantFormURL,
    logoUrl,
    supportEmail,
  });
  const text = buildTextFallback({
    businessName,
    merchantFormURL,
    supportEmail,
  });

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
