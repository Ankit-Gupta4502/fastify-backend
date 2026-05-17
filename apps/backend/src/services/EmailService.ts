
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    try {
      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject,
        html,
      });

      return response;
    } catch (error) {
      console.error("Email send failed:", error);
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