
import { Resend } from "resend";
import chalk from "chalk";

const resend = new Resend(process.env.RESEND_API_KEY);

const tag = chalk.bgCyan.black.bold(" EMAIL ");

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const from = (process.env.EMAIL_FROM ?? "(EMAIL_FROM not set)").replace(/^["']|["']$/g, "");

    console.log(
      tag,
      chalk.gray("→"),
      chalk.cyan("Sending"),
      chalk.white.bold(`"${subject}"`),
      chalk.gray("to"),
      chalk.yellow(to),
      chalk.gray("from"),
      chalk.yellow(from),
    );

    if (!process.env.RESEND_API_KEY) {
      console.warn(tag, chalk.red.bold("RESEND_API_KEY is not set — email skipped"));
      return;
    }
    if (!process.env.EMAIL_FROM) {
      console.warn(tag, chalk.red.bold("EMAIL_FROM is not set — email skipped"));
      return;
    }

    try {
      const response = await resend.emails.send({ from, to, subject, html });

      if (response.error) {
        console.error(
          tag,
          chalk.red("✗ Resend error:"),
          chalk.red(response.error.message),
        );
      } else {
        console.log(
          tag,
          chalk.green("✓ Sent"),
          chalk.gray("id:"),
          chalk.dim(response.data?.id ?? "—"),
        );
      }

      return response;
    } catch (error) {
      console.error(tag, chalk.red.bold("✗ Exception:"), error);
      throw error;
    }
  }

  static async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      subject: "Welcome to BookYourYogaTeacher!",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="BookYourYogaTeacher" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.85);">BookYourYogaTeacher</p>
            <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#fff;">Welcome aboard!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0;font-size:15px;color:#555;line-height:1.65;">
              Thanks for joining BookYourYogaTeacher. We're excited to help you find the perfect yoga teacher and start your practice.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">BookYourYogaTeacher · Breathe. Move. Grow.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  static async sendOtpEmail(to: string, otp: string) {
    return this.sendEmail({
      to,
      subject: "Your OTP Code — BookYourYogaTeacher",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="BookYourYogaTeacher" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.85);">BookYourYogaTeacher</p>
            <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#fff;">Your verification code</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;text-align:center;">
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.65;">Use the code below to verify your identity. It expires shortly.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#fdf8f4;border:2px solid #f0e4d8;border-radius:14px;padding:18px 40px;">
                  <p style="margin:0;font-size:36px;font-weight:700;color:#d96b3a;letter-spacing:.2em;">${otp}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#999;line-height:1.7;">If you didn't request this code, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">BookYourYogaTeacher · Breathe. Move. Grow.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  static async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    return this.sendEmail({
      to,
      subject: "Verify your email — BookYourYogaTeacher",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="BookYourYogaTeacher" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.85);">
              BookYourYogaTeacher
            </p>
            <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#fff;">
              Verify your email address
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333;">
              Hi <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.65;">
              Thanks for signing up. Please confirm your email address to activate your account.
              This link expires in <strong>1 hour</strong>.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);border-radius:12px;">
                  <a href="${verifyUrl}"
                    style="display:inline-block;padding:15px 40px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:.01em;">
                    Verify Email
                  </a>
                </td>
              </tr>
            </table>

            <!-- Fallback link box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fdf8f4;border:1px solid #f0e4d8;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                    Or copy this link into your browser
                  </p>
                  <p style="margin:0;font-size:12px;color:#c26030;word-break:break-all;line-height:1.5;">
                    ${verifyUrl}
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#999;line-height:1.7;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              BookYourYogaTeacher · Breathe. Move. Grow.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }

  static async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    return this.sendEmail({
      to,
      subject: "Reset your password — BookYourYogaTeacher",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="BookYourYogaTeacher" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.85);">
              BookYourYogaTeacher
            </p>
            <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#fff;">
              Password Reset Request
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333;">
              Hi <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.65;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link expires in <strong>1 hour</strong>.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);border-radius:12px;">
                  <a href="${resetUrl}"
                    style="display:inline-block;padding:15px 40px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:.01em;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>

            <!-- Fallback link box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fdf8f4;border:1px solid #f0e4d8;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                    Or copy this link into your browser
                  </p>
                  <p style="margin:0;font-size:12px;color:#c26030;word-break:break-all;line-height:1.5;">
                    ${resetUrl}
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#999;line-height:1.7;">
              If you didn't request a password reset, you can safely ignore this email — your password won't change.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              BookYourYogaTeacher · Breathe. Move. Grow.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }
}