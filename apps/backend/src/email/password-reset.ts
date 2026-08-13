/** Reset links stay valid for one hour. Referenced in the email copy below. */
export const PASSWORD_RESET_EXPIRATION_MS = 1000 * 60 * 60;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

/**
 * Password reset email for the Payload admin.
 *
 * Table-based layout with inline styles because email clients strip <style>
 * blocks and have inconsistent flexbox support. Payload's forgotPassword
 * operation sends HTML only, so the reset URL is also shown as text for clients
 * that suppress links.
 */
export function renderPasswordResetEmail({ resetUrl }: { resetUrl: string }): string {
  const href = escapeHtml(resetUrl);
  const hours = Math.round(PASSWORD_RESET_EXPIRATION_MS / (1000 * 60 * 60));

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f5f2ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2ed;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:10px;border:1px solid #e5ded4;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0 0 4px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a7f70;">55 Living Team</p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#26201a;font-weight:600;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4b4238;">
                  We received a request to reset the password for your 55 Living Team admin account.
                  Choose a new password using the button below.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <a href="${href}" style="display:inline-block;background-color:#26201a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:8px;">Reset password</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#8a7f70;">
                  This link expires in ${hours} hour${hours === 1 ? '' : 's'}.
                  If you did not request a password reset, you can ignore this email
                  and your password will stay unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;border-top:1px solid #efe9e1;">
                <p style="margin:24px 0 4px 0;font-size:12px;color:#8a7f70;">
                  If the button does not work, paste this link into your browser:
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#4b4238;word-break:break-all;">${href}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
