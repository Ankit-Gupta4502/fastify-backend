import { EmailService } from "./EmailService";
import { REFERRAL_REWARD_SESSION_COUNT } from "../constants/referral";

const APP_NAME = "BookYourYogaTeacher";

export interface ReferralRewardEmailParams {
  referrerName: string;
  referrerEmail: string;
  referredUserName: string;
}

export async function sendReferralRewardEmail(
  params: ReferralRewardEmailParams,
): Promise<void> {
  await EmailService.sendEmail({
    to: params.referrerEmail,
    subject: `You've earned ${REFERRAL_REWARD_SESSION_COUNT} free private sessions — ${APP_NAME}`,
    html: rewardEmailHtml(params),
  });
}

function rewardEmailHtml(p: ReferralRewardEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Referral Reward</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="${APP_NAME}" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${APP_NAME}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">
              🎁 Referral reward unlocked!
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#333;">
              Hi <strong>${p.referrerName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              <strong>${p.referredUserName}</strong>, who signed up with your referral link, just completed
              their first purchase. As a thank you, we've credited your account with
              <strong>${REFERRAL_REWARD_SESSION_COUNT} free private 1:1 sessions</strong>.
            </p>
            <p style="margin:0;font-size:14px;color:#777;line-height:1.7;">
              Head to your dashboard to book them, and keep sharing your referral link to earn more.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              ${APP_NAME} · Breathe. Move. Grow.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
