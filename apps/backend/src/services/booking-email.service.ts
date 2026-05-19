import { eq } from "drizzle-orm";
import { drizzle } from "../db";
import { rooms, user } from "../schema/schema";
import { EmailService } from "./EmailService";
import { formatForUser, formatForInstructor } from "./timezone.service";

const APP_NAME = "Solara Yoga";

export interface BookingEmailParams {
  userId: string;
  userName: string;
  userEmail: string;
  roomId: string;
}

export async function sendBookingConfirmationEmails(
  params: BookingEmailParams,
): Promise<void> {
  const [row] = await drizzle
    .select({
      type: rooms.type,
      scheduledStart: rooms.scheduledStart,
      scheduledEnd: rooms.scheduledEnd,
      capacity: rooms.capacity,
      instructorId: user.id,
      instructorName: user.name,
      instructorEmail: user.email,
    })
    .from(rooms)
    .innerJoin(user, eq(rooms.instructorId, user.id))
    .where(eq(rooms.id, params.roomId));

  if (!row) return;

  const userTime = formatForUser(row.scheduledStart, "UTC");
  const instructorTime = formatForInstructor(row.scheduledStart);
  const sessionType = row.type === "private" ? "Private 1:1" : "Group";

  const instructorSubject =
    row.type === "private"
      ? `New private 1:1 session booked with you — ${APP_NAME}`
      : `New participant joined your session — ${APP_NAME}`;

  await Promise.allSettled([
    EmailService.sendEmail({
      to: params.userEmail,
      subject: `Session confirmed — ${APP_NAME}`,
      html: studentConfirmationHtml({
        userName: params.userName,
        instructorName: row.instructorName,
        sessionType,
        startTime: userTime,
        appName: APP_NAME,
      }),
    }),
    EmailService.sendEmail({
      to: row.instructorEmail,
      subject: instructorSubject,
      html: instructorNotificationHtml({
        instructorName: row.instructorName,
        studentName: params.userName,
        sessionType,
        startTime: instructorTime,
        appName: APP_NAME,
      }),
    }),
  ]);
}

// ── Email templates ────────────────────────────────────────────────────────

function studentConfirmationHtml(p: {
  userName: string;
  instructorName: string;
  sessionType: string;
  startTime: string;
  appName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Session Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${p.appName}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">
              🧘 You're booked!
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
              Your <strong>${p.sessionType}</strong> session is confirmed. Get your mat ready!
            </p>

            <!-- Session details box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fdf8f4;border:1px solid #f0e4d8;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <DetailRow label="Instructor" value="${p.instructorName}" />
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
                        Type
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.sessionType}
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
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#777;line-height:1.7;">
              A few minutes before the session starts, head to your dashboard and click
              <strong> Join</strong> to enter the live room.
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

function instructorNotificationHtml(p: {
  instructorName: string;
  studentName: string;
  sessionType: string;
  startTime: string;
  appName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Participant</title>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#3a7bd9,#4a9ae8);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${p.appName}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">
              🙌 New student joined
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#333;">
              Hi <strong>${p.instructorName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              <strong>${p.studentName}</strong> has just joined your upcoming
              <strong> ${p.sessionType}</strong> session.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f4f8fd;border:1px solid #d8e8f0;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:110px;">
                        Student
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.studentName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">
                        Session
                      </td>
                      <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">
                        ${p.sessionType}
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
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#777;line-height:1.7;">
              Head to your instructor dashboard to view your full schedule and open the studio.
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
