
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
    const from = process.env.EMAIL_FROM ?? "(EMAIL_FROM not set)";

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
      subject: "Welcome!",
      html: `
        <h1>Welcome ${name}</h1>
        <p>Thanks for joining.</p>
      `,
    });
  }

  static async sendOtpEmail(to: string, otp: string) {
    return this.sendEmail({
      to,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP</h2>
        <p style="font-size:24px;font-weight:bold;">
          ${otp}
        </p>
      `,
    });
  }

  static async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    return this.sendEmail({
      to,
      subject: "Reset your password — BookYourYogaTeacher",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8e4dc;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">BookYourYogaTeacher</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Password Reset Request</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1a1a2e;">Hi ${name},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link expires in <strong>1 hour</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Or copy this link into your browser:</p>
            <p style="margin:0 0 24px;font-size:11px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
              If you didn't request a password reset, you can safely ignore this email — your password won't change.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f7f4;padding:20px 40px;border-top:1px solid #e8e4dc;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">© BookYourYogaTeacher · Sent with care</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  }
}