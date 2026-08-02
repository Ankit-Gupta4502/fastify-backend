import { config } from "../config";
import { EmailService } from "./EmailService";

const APP_NAME = "BookYourYogaTeacher";

export interface OrganizationInviteEmailParams {
  inviteeEmail: string;
  organizationName: string;
  inviterName: string;
  inviteToken: string;
}

export function buildOrganizationInviteLink(token: string): string {
  return `${config.frontend.url}/login?orgInviteToken=${token}`;
}

export async function sendOrganizationInviteEmail(
  params: OrganizationInviteEmailParams,
): Promise<void> {
  const link = buildOrganizationInviteLink(params.inviteToken);
  await EmailService.sendEmail({
    to: params.inviteeEmail,
    subject: `${params.inviterName} invited you to join ${params.organizationName} on ${APP_NAME}`,
    html: inviteEmailHtml({ ...params, link }),
  });
}

function inviteEmailHtml(
  p: OrganizationInviteEmailParams & { link: string },
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Organization Invite</title>
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
            <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#fff;">
              You're invited to ${p.organizationName}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#333;">
              Hi,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              <strong>${p.inviterName}</strong> has invited you to join <strong>${p.organizationName}</strong>'s
              workspace on ${APP_NAME}.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
              <tr>
                <td style="border-radius:10px;background:#d96b3a;">
                  <a href="${p.link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
                    Accept invite
                  </a>
                </td>
              </tr>
            </table>
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
