import { EmailService } from "./EmailService";

const APP_NAME = "BookYourYogaTeacher";

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
  const purposeList = p.purposes.map((goal) => `• ${goal}`).join("\n");

  await EmailService.sendEmail({
    to: p.adminEmail,
    subject: `New Free Yoga Demo Request — ${APP_NAME}`,
    html: adminNotificationHtml({ ...p, purposeList }),
  });
}

export async function sendDemoRequestUserAck(p: {
  userEmail: string;
  userName: string;
}): Promise<void> {
  await EmailService.sendEmail({
    to: p.userEmail,
    subject: `We received your demo request — ${APP_NAME}`,
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
    subject: `Action required — your demo request — ${APP_NAME}`,
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
    subject: `Instructor assigned for your demo — ${APP_NAME}`,
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
    subject: `Your Free Yoga Demo Session Is Confirmed — ${APP_NAME}`,
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

// ── Email templates ──────────────────────────────────────────────────────────

function wrap(header: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#d96b3a,#e8924a);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.8);">
              ${APP_NAME}
            </p>
            <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#fff;">${header}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">${body}</td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;border-top:1px solid #f0ece8;">
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

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:130px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#333;font-weight:600;">${value}</td>
  </tr>`;
}

function infoBox(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"
    style="background:#fdf8f4;border:1px solid #f0e4d8;border-radius:12px;margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
  </table>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">${text}</p>`;
}

function adminNotificationHtml(params: {
  userName: string;
  userEmail: string;
  phone: string;
  purposeList: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}): string {
  const body = `
    ${p("A new free demo class request has been submitted. Please review and assign an instructor.")}
    ${infoBox(
      detailRow("User", params.userName) +
        detailRow("Email", params.userEmail) +
        detailRow("Phone", params.phone),
    )}
    ${infoBox(
      detailRow("Preferred Date", params.preferredDate) +
        detailRow("Preferred Time", params.preferredTime) +
        detailRow("Timezone", params.timezone),
    )}
    <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Goals</p>
    <p style="margin:0;font-size:14px;color:#333;line-height:1.8;white-space:pre-line;">${params.purposeList}</p>
  `;
  return wrap("New Demo Request", body);
}

function userAckHtml(params: { userName: string }): string {
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p("Thank you for requesting a free yoga demo class. Our team will review your details and match you with the most suitable instructor.")}
    ${p("You will receive another email once your session is confirmed along with the meeting link.")}
    ${p("In the meantime, keep an eye on your inbox and feel free to reach out if you have any questions.")}
  `;
  return wrap("Request Received!", body);
}

function userApprovedHtml(params: { userName: string }): string {
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p("Great news — your demo class request has been approved! We are now matching you with an instructor and will send you a meeting link shortly.")}
    ${p("Please check your inbox over the next few hours for your session details.")}
  `;
  return wrap("Request Approved!", body);
}

function userRejectedHtml(params: {
  userName: string;
  reason: string | null;
}): string {
  const reasonLine = params.reason
    ? `${p(`<strong>Reason:</strong> ${params.reason}`)}`
    : "";
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p("Unfortunately, we were unable to approve your demo class request at this time.")}
    ${reasonLine}
    ${p("If you believe this was a mistake or would like to try again, please submit a new request or contact our support team.")}
  `;
  return wrap("Update on Your Request", body);
}

function userNeedsInfoHtml(params: {
  userName: string;
  message: string;
}): string {
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p("Our team reviewed your demo class request and needs a bit more information before we can proceed.")}
    ${infoBox(detailRow("Message from team", params.message))}
    ${p("Please log in to your dashboard and update your request with the requested details.")}
  `;
  return wrap("Action Required", body);
}

function userInstructorAssignedHtml(params: {
  userName: string;
  instructorName: string;
}): string {
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p(`We have matched you with your instructor: <strong>${params.instructorName}</strong>.`)}
    ${p("We are now scheduling your session and will send the meeting link very shortly. Please stay tuned!")}
  `;
  return wrap("Instructor Matched!", body);
}

function userMeetingScheduledHtml(params: {
  userName: string;
  instructorName: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): string {
  const body = `
    ${p(`Hi <strong>${params.userName}</strong>,`)}
    ${p("Your free yoga demo session is confirmed. We look forward to helping you begin your yoga journey!")}
    ${infoBox(
      detailRow("Instructor", params.instructorName) +
        detailRow("Date", params.preferredDate) +
        detailRow("Time", `${params.preferredTime} (${params.timezone})`),
    )}
    <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Meeting Link</p>
    <p style="margin:0 0 24px;">
      <a href="${params.meetingLink}" style="color:#d96b3a;font-size:14px;font-weight:600;">${params.meetingLink}</a>
    </p>
    ${p("Please join a few minutes early to make sure your camera and microphone are ready.")}
  `;
  return wrap("Your Demo Session Is Confirmed!", body);
}

function instructorAssignmentHtml(params: {
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
  const purposeList = params.purposes.map((g) => `• ${g}`).join("\n");
  const body = `
    ${p(`Hi <strong>${params.instructorName}</strong>,`)}
    ${p("A free demo session has been assigned to you. Please review the student details below.")}
    ${infoBox(
      detailRow("Student", params.userName) +
        detailRow("Email", params.userEmail) +
        detailRow("Phone", params.phone),
    )}
    ${infoBox(
      detailRow("Date", params.preferredDate) +
        detailRow("Time", `${params.preferredTime} (${params.timezone})`),
    )}
    <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Student Goals</p>
    <p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.8;white-space:pre-line;">${purposeList}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Meeting Link</p>
    <p style="margin:0;">
      <a href="${params.meetingLink}" style="color:#d96b3a;font-size:14px;font-weight:600;">${params.meetingLink}</a>
    </p>
  `;
  return wrap("New Demo Session Assigned", body);
}
