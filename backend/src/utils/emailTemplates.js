// Email clients (Outlook especially) don't reliably support external/embedded
// CSS or modern layout (flex/grid) — table-based markup with inline styles
// is still the only approach with consistent cross-client rendering. This
// module centralizes that boilerplate so individual services only need to
// supply title/body content, not re-derive a compliant email shell each time.

const BRAND = {
  name: process.env.MAIL_BRAND_NAME || 'Opportunity App',
  primaryColor: '#4F46E5',
  textColor: '#1F2937',
  mutedColor: '#6B7280',
  borderColor: '#E5E7EB',
  backgroundColor: '#F3F4F6',
  cardColor: '#FFFFFF',
  logoUrl: process.env.MAIL_LOGO_URL || '',
  appUrl: process.env.PUBLIC_APP_URL || '',
};

/**
 * Wraps body content in the standard branded shell: header with logo,
 * white card body, footer with a settings/unsubscribe note.
 *
 * @param {Object} opts
 * @param {string} opts.preheader - Hidden preview text shown in inbox lists (not in body).
 * @param {string} opts.title - Large heading at the top of the card.
 * @param {string} opts.bodyHtml - Main content, already-formatted HTML (paragraphs, tables, etc).
 * @param {{ label: string, url: string }} [opts.cta] - Optional primary call-to-action button.
 * @param {string} [opts.footerNote] - Optional extra line under the standard footer text.
 */
const renderEmail = ({ preheader = '', title, bodyHtml, cta, footerNote }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.backgroundColor}; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader: hidden, but shown by inbox clients as the preview snippet -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.backgroundColor}; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:${BRAND.cardColor}; border-radius:8px; overflow:hidden; border:1px solid ${BRAND.borderColor};">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px; border-bottom:1px solid ${BRAND.borderColor};">
              ${BRAND.logoUrl
                ? `<img src="${BRAND.logoUrl}" alt="${escapeHtml(BRAND.name)}" height="28" style="display:block;" />`
                : `<span style="font-size:18px; font-weight:700; color:${BRAND.primaryColor};">${escapeHtml(BRAND.name)}</span>`
              }
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px; font-size:20px; line-height:28px; color:${BRAND.textColor};">
                ${escapeHtml(title)}
              </h1>
              <div style="font-size:14px; line-height:22px; color:${BRAND.textColor};">
                ${bodyHtml}
              </div>

              ${cta ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="border-radius:6px; background-color:${BRAND.primaryColor};">
                    <a href="${cta.url}" target="_blank"
                      style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#FFFFFF; text-decoration:none; border-radius:6px;">
                      ${escapeHtml(cta.label)}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:${BRAND.backgroundColor}; border-top:1px solid ${BRAND.borderColor};">
              <p style="margin:0 0 4px; font-size:12px; line-height:18px; color:${BRAND.mutedColor};">
                This is an automated message from ${escapeHtml(BRAND.name)}.
                ${footerNote ? escapeHtml(footerNote) : 'You can manage your notification preferences from Settings in the app.'}
              </p>
              <p style="margin:0; font-size:12px; line-height:18px; color:${BRAND.mutedColor};">
                &copy; ${new Date().getFullYear()} ${escapeHtml(BRAND.name)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/**
 * Renders a labeled key/value definition table — used for structured
 * technical details (opportunity specs, ticket metadata, etc) inside an
 * email body, since plain paragraphs don't align well for tabular data.
 * @param {{ label: string, value: string }[]} rows
 */
const renderDetailsTable = (rows) => {
  const rowsHtml = rows
    .filter((r) => r.value)
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 12px 6px 0; font-size:13px; color:${BRAND.mutedColor}; white-space:nowrap; vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:6px 0; font-size:13px; color:${BRAND.textColor}; vertical-align:top;">${escapeHtml(r.value)}</td>
      </tr>`
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px; border-top:1px solid ${BRAND.borderColor}; padding-top:12px; width:100%;">
      ${rowsHtml}
    </table>`;
};

module.exports = { renderEmail, renderDetailsTable, escapeHtml, BRAND };