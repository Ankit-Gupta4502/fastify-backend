import { EmailService } from "./EmailService";

const APP_NAME = "BookYourYogaTeacher";

const LOGO_URL = "https://pub-89b1de93308a45efb0b4e47ee91424a6.r2.dev/uploads/android-chrome-512x512.png";
const BRAND_PRIMARY = "#d96b3a";
const BRAND_DARK = "#b45309";
const BRAND_LIGHT = "#fdf8f4";

// ── Public senders ────────────────────────────────────────────────────────────

export async function sendDemoRequestAdminNotification(p: {
  adminEmail: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.adminEmail,
    subject: `New Free Demo Request from ${p.userName} — ${APP_NAME}`,
    html: adminNotificationHtml(p),
  });
}

export async function sendDemoRequestUserAck(p: {
  userEmail: string;
  userName: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `We've received your demo request — ${APP_NAME}`,
    html: userAckHtml(p),
  });
}

export async function sendDemoRequestApproved(p: {
  userEmail: string;
  userName: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `Your demo request is approved — ${APP_NAME}`,
    html: userApprovedHtml(p),
  });
}

export async function sendDemoRequestRejected(p: {
  userEmail: string;
  userName: string;
  reason: string | null;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `Update on your demo request — ${APP_NAME}`,
    html: userRejectedHtml(p),
  });
}

export async function sendDemoRequestNeedsInfo(p: {
  userEmail: string;
  userName: string;
  message: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `Action required on your demo request — ${APP_NAME}`,
    html: userNeedsInfoHtml(p),
  });
}

export async function sendDemoInstructorAssigned(p: {
  userEmail: string;
  userName: string;
  instructorName: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `Instructor matched for your demo — ${APP_NAME}`,
    html: userInstructorAssignedHtml(p),
  });
}

export async function sendDemoMeetingScheduled(p: {
  userEmail: string;
  userName: string;
  instructorName: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `Your free yoga demo is confirmed — ${APP_NAME}`,
    html: userMeetingScheduledHtml(p),
  });
}

export async function sendDemoInstructorNotification(p: {
  instructorEmail: string;
  instructorName: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.instructorEmail,
    subject: `New demo session assigned to you — ${APP_NAME}`,
    html: instructorAssignmentHtml(p),
  });
}

// ── Layout primitives ─────────────────────────────────────────────────────────

function layout(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden preview text) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0eb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0" border="0">

        <!-- Logo row -->
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <img src="${LOGO_URL}"
                    alt="${APP_NAME}"
                    width="40" height="40"
                    style="display:block;border-radius:8px;border:0;outline:none;text-decoration:none;"
                    onerror="this.style.display='none'"/>
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-size:15px;font-weight:700;color:#b45309;letter-spacing:.02em;">${APP_NAME}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,.07);">

            <!-- Header band -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,${BRAND_DARK} 100%);padding:36px 40px;text-align:center;">
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</h1>
                </td>
              </tr>
            </table>

            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:36px 40px 28px;">
                  ${body}
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:16px 40px 28px;border-top:1px solid #f0ebe4;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#b0a89e;line-height:1.6;">
                    ${APP_NAME} &nbsp;·&nbsp; Breathe. Move. Grow.<br/>
                    You're receiving this because you have an account with us.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 18px;font-size:15px;color:#4a4a4a;line-height:1.7;">${text}</p>`;
}

function infoTable(rows: Array<[string, string]>): string {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 16px 8px 0;font-size:12px;font-weight:700;color:#9c8b7e;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap;vertical-align:top;width:110px;">${label}</td>
        <td style="padding:8px 0;font-size:14px;color:#2d2d2d;font-weight:600;vertical-align:top;">${value}</td>
      </tr>`,
    )
    .join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:${BRAND_LIGHT};border:1px solid #f0e4d8;border-radius:12px;margin-bottom:24px;">
    <tr><td style="padding:16px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
    </td></tr>
  </table>`;
}

function ctaButton(label: string, href: string): string {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td style="border-radius:10px;background:${BRAND_PRIMARY};">
        <a href="${href}"
          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:.01em;border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 18px;font-size:12px;color:#a09890;line-height:1.6;">
    Or copy this link into your browser:<br/>
    <a href="${href}" style="color:${BRAND_PRIMARY};word-break:break-all;">${href}</a>
  </p>`;
}

function divider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid #f0ebe4;"/>`;
}

// ── Email bodies ──────────────────────────────────────────────────────────────

function adminNotificationHtml(p: {
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}): string {
  const body = `
    ${para(`A new free demo class request has been submitted by <strong>${p.userName}</strong>. Please log in to review and approve.`)}
    ${infoTable([
      ["Name", p.userName],
      ["Email", p.userEmail],
      ["Phone", p.phone],
    ])}
    ${infoTable([
      ["Date", p.preferredDate],
      ["Time", `${p.preferredTime} (${p.timezone})`],
      ["Goals", p.purposes.join(", ")],
    ])}
  `;
  return layout("New Demo Request", `${p.userName} has requested a free demo class`, body);
}

function userAckHtml(p: { userName: string }): string {
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("Thank you for requesting a free yoga demo class with us! We have received your details and our team will review them shortly.")}
    ${para("Once your session is confirmed, you will receive a follow-up email with your instructor's details and the meeting link.")}
    ${para("We look forward to guiding you on your yoga journey. 🙏")}
  `;
  return layout("Request Received!", "We've received your demo class request", body);
}

function userApprovedHtml(p: { userName: string }): string {
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("Great news — your free yoga demo class request has been <strong>approved</strong>!")}
    ${para("We are now finalising your instructor and will send you the meeting link very shortly. Please keep an eye on your inbox.")}
    ${para("In the meantime, feel free to reach out if you have any questions.")}
  `;
  return layout("You're Approved! 🎉", "Your demo class request has been approved", body);
}

function userRejectedHtml(p: { userName: string; reason: string | null }): string {
  const reasonSection = p.reason
    ? infoTable([["Reason", p.reason]])
    : "";
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("Unfortunately we were unable to approve your demo class request at this time.")}
    ${reasonSection}
    ${para("If you believe this was a mistake or would like to try again, please submit a new request or contact our support team.")}
  `;
  return layout("Update on Your Request", "An update on your demo class request", body);
}

function userNeedsInfoHtml(p: { userName: string; message: string }): string {
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("Our team reviewed your demo class request and needs a little more information before we can proceed.")}
    ${infoTable([["Message", p.message]])}
    ${para("Please log in to your dashboard and update your request with the information above.")}
  `;
  return layout("Action Required", "We need a bit more info to process your request", body);
}

function userInstructorAssignedHtml(p: {
  userName: string;
  instructorName: string;
}): string {
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("We have matched you with your instructor — exciting!")}
    ${infoTable([["Instructor", p.instructorName]])}
    ${para("We are scheduling your session and will send the meeting link very shortly. Stay tuned!")}
  `;
  return layout("Instructor Matched!", `Meet your instructor: ${p.instructorName}`, body);
}

function userMeetingScheduledHtml(p: {
  userName: string;
  instructorName: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): string {
  const body = `
    ${para(`Hi <strong>${p.userName}</strong>,`)}
    ${para("Your free yoga demo session is confirmed and ready to go. We can't wait to help you begin your yoga journey!")}
    ${infoTable([
      ["Instructor", p.instructorName],
      ["Date", p.preferredDate],
      ["Time", `${p.preferredTime} (${p.timezone})`],
    ])}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#9c8b7e;text-transform:uppercase;letter-spacing:.07em;">Join Your Session</p>
    ${ctaButton("Join Meeting →", p.meetingLink)}
    ${divider()}
    ${para("Please join a few minutes early to check your camera and microphone. See you on the mat!")}
  `;
  return layout(
    "Your Demo Session Is Confirmed! 🧘",
    `Your yoga demo with ${p.instructorName} is confirmed`,
    body,
  );
}

function instructorAssignmentHtml(p: {
  instructorName: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): string {
  const body = `
    ${para(`Hi <strong>${p.instructorName}</strong>,`)}
    ${para("A new free demo session has been assigned to you. Please review the student details below and be ready at the scheduled time.")}
    ${infoTable([
      ["Student", p.userName],
      ["Email", p.userEmail],
      ["Phone", p.phone],
    ])}
    ${infoTable([
      ["Date", p.preferredDate],
      ["Time", `${p.preferredTime} (${p.timezone})`],
      ["Goals", p.purposes.join(", ")],
    ])}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#9c8b7e;text-transform:uppercase;letter-spacing:.07em;">Meeting Link</p>
    ${ctaButton("Open Meeting →", p.meetingLink)}
  `;
  return layout(
    "New Demo Session Assigned",
    `You have a new demo session with ${p.userName}`,
    body,
  );
}
