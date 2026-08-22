import { eq } from "drizzle-orm";
import { drizzle } from "../db";
import { user, workshops } from "../schema/schema";
import { DEFAULT_USER_TIMEZONE } from "../constants/sessions";
import { EmailService } from "./EmailService";
import { formatForUser } from "./timezone.service";

const APP_NAME = "BookYourYogaTeacher";

export interface WorkshopEmailParams {
  userId: string;
  userName: string;
  userEmail: string;
  workshopId: string;
  pricePaid: number | null;
  currency: string | null;
}

export async function sendWorkshopConfirmationEmail(params: WorkshopEmailParams): Promise<void> {
  const [workshop] = await drizzle
    .select({
      name: workshops.name,
      scheduledAt: workshops.scheduledAt,
      meetLink: workshops.meetLink,
    })
    .from(workshops)
    .where(eq(workshops.id, params.workshopId));

  if (!workshop) return;

  const [userRecord] = await drizzle
    .select({ timezone: user.timezone })
    .from(user)
    .where(eq(user.id, params.userId));

  const startTime = workshop.scheduledAt
    ? formatForUser(workshop.scheduledAt, userRecord?.timezone ?? DEFAULT_USER_TIMEZONE)
    : null;

  const priceLabel =
    params.pricePaid != null && params.currency
      ? `${params.currency === "INR" ? "₹" : "$"}${(params.pricePaid / 100).toFixed(0)}`
      : null;

  await EmailService.sendEmail({
    to: params.userEmail,
    subject: `You're registered — ${workshop.name} — ${APP_NAME}`,
    html: confirmationHtml({
      userName: params.userName,
      workshopName: workshop.name,
      startTime,
      meetLink: workshop.meetLink,
      priceLabel,
      appName: APP_NAME,
    }),
  });
}

function confirmationHtml(p: {
  userName: string;
  workshopName: string;
  startTime: string | null;
  meetLink: string | null;
  priceLabel: string | null;
  appName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Workshop Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <img src="https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png"
              alt="${p.appName}" width="56" height="56"
              style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${p.appName}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">
              🧘 You're registered!
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#333;">
              Hi <strong>${p.userName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              Your spot in <strong>${p.workshopName}</strong> is confirmed. Get your mat ready!
            </p>

            <!-- Workshop details box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fdf8f4;border:1px solid #f0e4d8;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:110px;">
                        Workshop
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.workshopName}
                      </td>
                    </tr>
                    ${p.startTime ? `<tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Starts at
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.startTime}
                      </td>
                    </tr>` : ""}
                    ${p.priceLabel ? `<tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Amount paid
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.priceLabel}
                      </td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#777;line-height:1.7;">
              ${p.meetLink
                ? `A few minutes before the workshop starts, join here: <a href="${p.meetLink}" style="color:#c26030;">${p.meetLink}</a>`
                : "We'll send the joining details closer to the date."}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              ${p.appName} · Breathe. Move. Grow.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
