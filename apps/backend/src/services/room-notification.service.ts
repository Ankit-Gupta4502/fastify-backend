import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { plans, user, userSubscriptions } from "../schema/schema";
import { PLAN_NAME } from "../constants/sessions";
import { EmailService } from "./EmailService";
import { formatForUser } from "./timezone.service";

const APP_NAME = "BookYourYogaTeacher";

export async function notifyEligibleGroupUsers(
  db: AppDatabase,
  roomId: string,
  roomDetails: {
    scheduledStart: Date;
    instructorId: string;
    instructorName: string;
    meetLink?: string | null;
  },
): Promise<void> {
  // Find users with an active group_live subscription who still have weekly quota
  // and haven't already booked this room.
  const eligibleUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
    })
    .from(user)
    .innerJoin(userSubscriptions, eq(userSubscriptions.userId, user.id))
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .where(
      and(
        eq(userSubscriptions.status, "active"),
        eq(plans.name, PLAN_NAME.GROUP_LIVE),
        // quota remaining
        sql`${user.sessionsUsedThisWeek} < ${plans.sessionsPerWeek}`,
        // not already booked into this room
        sql`${user.id} NOT IN (
          SELECT "user_id" FROM "room_users" WHERE "room_id" = ${roomId}
        )`,
      ),
    );

  if (eligibleUsers.length === 0) return;

  await Promise.allSettled(
    eligibleUsers.map((u) =>
      EmailService.sendEmail({
        to: u.email,
        subject: `New group class just opened — ${APP_NAME}`,
        html: newGroupClassHtml({
          userName: u.name,
          instructorName: roomDetails.instructorName,
          startTime: formatForUser(roomDetails.scheduledStart, u.timezone),
          meetLink: roomDetails.meetLink ?? null,
          appName: APP_NAME,
        }),
      }),
    ),
  );
}

function newGroupClassHtml(p: {
  userName: string;
  instructorName: string;
  startTime: string;
  meetLink: string | null;
  appName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Group Class</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#5b8a52,#7ab86e);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${p.appName}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">
              🧘 New class available!
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#333;">
              Hi <strong>${p.userName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              A new group class has just been scheduled. Spots are limited — reserve yours now!
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f4fdf2;border:1px solid #d4eece;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:110px;">
                        Instructor
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.instructorName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Starts at
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.startTime}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Type
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        Group Live Class
                      </td>
                    </tr>
                    ${p.meetLink ? `
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Join via
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        <a href="${p.meetLink}" style="color:#5b8a52;text-decoration:none;font-weight:700;">
                          Google Meet ↗
                        </a>
                      </td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>
            ${p.meetLink ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${p.meetLink}"
                    style="display:inline-block;background:#5b8a52;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">
                    Join on Google Meet
                  </a>
                </td>
              </tr>
            </table>` : ""}
            <p style="margin:0;font-size:14px;color:#777;line-height:1.7;">
              ${p.meetLink
                ? "Click the button above to join the class, or head to your dashboard to manage your booking."
                : "Head to your dashboard and click <strong>Join</strong> to reserve your spot before it fills up."
              }
            </p>
          </td>
        </tr>
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
