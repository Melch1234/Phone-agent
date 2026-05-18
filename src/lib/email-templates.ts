const SUPPORT_EMAIL = 'fun@bugme.travel'

function base(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:20px 28px;border-radius:8px 8px 0 0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;background:#4f8ef7;border-radius:50%;text-align:center;vertical-align:middle;">
                <span style="color:#ffffff;font-weight:800;font-size:15px;line-height:32px;display:block;">T</span>
              </td>
              <td style="padding-left:10px;color:#ffffff;font-weight:700;font-size:15px;letter-spacing:0.3px;">Ringo</td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:28px 32px 24px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #eeeeee;padding:14px 32px;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">
              Ringo &nbsp;·&nbsp; Questions? Email us any time at
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#4f8ef7;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function pinBox(pin: string): string {
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
      <tr>
        <td style="background:#f0f4ff;border-left:3px solid #4f8ef7;border-radius:0 6px 6px 0;padding:12px 16px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4f8ef7;">Your PIN</p>
          <p style="margin:0;font-size:26px;font-weight:800;color:#1a1a2e;letter-spacing:8px;">${pin}</p>
        </td>
      </tr>
    </table>`
}

function phoneBox(number: string): string {
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
      <tr>
        <td style="background:#f0f4ff;border-left:3px solid #4f8ef7;border-radius:0 6px 6px 0;padding:12px 16px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4f8ef7;">Your Number</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#1a1a2e;letter-spacing:2px;">${number}</p>
        </td>
      </tr>
    </table>`
}

function ctaButton(text: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">
      <tr>
        <td style="background:#4f8ef7;border-radius:6px;">
          <a href="${url}" style="display:block;padding:11px 24px;color:#ffffff;font-weight:700;font-size:13px;text-decoration:none;text-align:center;">${text} →</a>
        </td>
      </tr>
    </table>`
}

function divider(): string {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;"><tr><td style="border-top:1px solid #eeeeee;font-size:0;">&nbsp;</td></tr></table>`
}

// 1. Welcome email — sent after Stripe payment
export function welcomeEmail(opts: {
  ownerName: string
  businessName: string
  pin: string
  dashboardUrl: string
}): string {
  const body = `
    <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#1a1a2e;">You're in — we're setting up your line</h1>
    <p style="margin:0 0 12px;color:#444444;line-height:1.6;">Hi ${opts.ownerName}, payment confirmed! We're setting up your dedicated AI phone line for <strong>${opts.businessName}</strong>.</p>
    ${pinBox(opts.pin)}
    <p style="margin:-4px 0 14px;font-size:12px;color:#999999;">Keep this safe — you'll need it to log in to your dashboard.</p>
    ${divider()}
    <p style="margin:0 0 10px;font-weight:700;color:#1a1a2e;">What happens next:</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${['We\'ll assign you a dedicated phone number (usually within a few hours).', 'You\'ll receive a second email with your number and activation details.', 'Forward that number to your existing line, or use it directly with guests.'].map((step, i) => `
      <tr>
        <td style="vertical-align:top;padding:0 10px 10px 0;width:24px;">
          <div style="width:20px;height:20px;background:#1a1a2e;border-radius:50%;text-align:center;line-height:20px;color:#ffffff;font-size:10px;font-weight:700;">${i + 1}</div>
        </td>
        <td style="vertical-align:top;padding:0 0 10px;color:#444444;line-height:1.6;font-size:14px;">${step}</td>
      </tr>`).join('')}
    </table>
    ${ctaButton('View Your Dashboard', opts.dashboardUrl)}`
  return base(body)
}

// 2. Activation email — sent when admin assigns number + activates
export function activationEmail(opts: {
  ownerName: string
  businessName: string
  pin: string
  twilioNumber: string
  dashboardUrl: string
}): string {
  const body = `
    <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#1a1a2e;">Your AI phone line is live 🎉</h1>
    <p style="margin:0 0 12px;color:#444444;line-height:1.6;">Hi ${opts.ownerName} — great news. Your dedicated AI phone line for <strong>${opts.businessName}</strong> is active and answering calls 24/7.</p>
    ${phoneBox(opts.twilioNumber)}
    ${divider()}
    <p style="margin:0 0 10px;font-weight:700;color:#1a1a2e;">Get started in 3 steps:</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${[
        `Log in to your dashboard using your PIN: <strong style="letter-spacing:3px;">${opts.pin}</strong>`,
        'Add your FAQs and greeting so the AI knows your tours.',
        `Forward <strong>${opts.twilioNumber}</strong> to your business phone, or share it directly with guests.`,
      ].map((step, i) => `
      <tr>
        <td style="vertical-align:top;padding:0 10px 10px 0;width:24px;">
          <div style="width:20px;height:20px;background:#1a1a2e;border-radius:50%;text-align:center;line-height:20px;color:#ffffff;font-size:10px;font-weight:700;">${i + 1}</div>
        </td>
        <td style="vertical-align:top;padding:0 0 10px;color:#444444;line-height:1.6;font-size:14px;">${step}</td>
      </tr>`).join('')}
    </table>
    ${ctaButton('Open Dashboard', opts.dashboardUrl)}
    <p style="margin:12px 0 0;font-size:12px;color:#999999;">Your morning briefing email arrives at 6am UTC each day.</p>`
  return base(body)
}

// 3. Forgot PIN email — sent when operator requests PIN reset
export function forgotPinEmail(opts: {
  ownerName: string
  businessName: string
  newPin: string
  loginUrl: string
}): string {
  const body = `
    <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#1a1a2e;">Your new dashboard PIN</h1>
    <p style="margin:0 0 12px;color:#444444;line-height:1.6;">Hi ${opts.ownerName} — here's your new PIN for <strong>${opts.businessName}</strong>. Use it to log in below.</p>
    ${pinBox(opts.newPin)}
    ${ctaButton('Log In to Dashboard', opts.loginUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your previous PIN is no longer valid.</p>`
  return base(body)
}
