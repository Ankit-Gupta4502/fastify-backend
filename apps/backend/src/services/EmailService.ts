
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
}