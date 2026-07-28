/**
 * Sends an email via Resend to an explicit recipient. No-ops unless
 * RESEND_API_KEY + RESEND_FROM are set, and never throws — notifications must
 * not break a visitor's form submission.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch {
    // swallow — a failed notification should never surface to the visitor
  }
}

/** Emails the producer. No-ops unless PRODUCER_NOTIFY_EMAIL is also set. */
export async function notifyProducer(subject: string, html: string): Promise<void> {
  const to = process.env.PRODUCER_NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail(to, subject, html);
}

/** Emails a customer at the address they submitted (confirmation receipts). */
export async function notifyCustomer(to: string, subject: string, html: string): Promise<void> {
  if (!to || !to.includes("@")) return;
  await sendEmail(to, subject, html);
}

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));

export function requestEmail(r: {
  name: string;
  email: string;
  genre: string;
  bpm: string;
  budget: string;
  notes: string;
  voiceUrl?: string;
}): string {
  return `
    <h2>New custom beat request</h2>
    <p><strong>${esc(r.name)}</strong> &lt;${esc(r.email)}&gt;</p>
    <p>${esc(r.genre)} · ${esc(r.bpm)} BPM · Budget ${esc(r.budget)}</p>
    ${r.notes ? `<p>${esc(r.notes)}</p>` : ""}
    ${r.voiceUrl ? `<p>🎤 <a href="${esc(r.voiceUrl)}">Voice idea attached</a></p>` : ""}
    <p>Open your dashboard to manage it.</p>
  `;
}

export function bookingEmail(b: {
  name: string;
  email: string;
  service: string;
  date: string;
}): string {
  return `
    <h2>New booking request</h2>
    <p><strong>${esc(b.name)}</strong> &lt;${esc(b.email)}&gt;</p>
    <p>${esc(b.service)}${b.date ? ` · ${esc(b.date)}` : ""}</p>
    <p>Open your dashboard to accept or reschedule.</p>
  `;
}

// ── Customer-facing confirmation receipts ────────────────────────────────────

export function customerRequestEmail(r: { name: string; genre: string; bpm: string; budget: string }): string {
  return `
    <h2>Thanks for your custom beat request 🎧</h2>
    <p>Hi ${esc(r.name)}, we've received your request and Ibiga will review it and respond within 24–48 hours.</p>
    <p><strong>Your request:</strong> ${esc(r.genre)}${r.bpm ? ` · ${esc(r.bpm)} BPM` : ""}${r.budget ? ` · Budget ${esc(r.budget)}` : ""}</p>
    <p>— Ibiga Beatz</p>
  `;
}

export function customerBookingEmail(b: { name: string; service: string; date: string }): string {
  return `
    <h2>Your booking request is in ✅</h2>
    <p>Hi ${esc(b.name)}, we've received your booking for <strong>${esc(b.service)}</strong>${b.date ? ` on ${esc(b.date)}` : ""}.</p>
    <p>Ibiga will confirm the details with you shortly.</p>
    <p>— Ibiga Beatz</p>
  `;
}

// ── Orders ───────────────────────────────────────────────────────────────────

function naira(n: number): string {
  return `₦${Math.round(Number.isFinite(n) ? n : 0).toLocaleString("en-NG")}`;
}

export function orderEmail(o: { beatTitle: string; amount: number; name: string; email: string; phone: string; note: string }): string {
  return `
    <h2>New beat order 🛒</h2>
    <p><strong>${esc(o.beatTitle)}</strong> — ${naira(o.amount)}</p>
    <p>${esc(o.name)} &lt;${esc(o.email)}&gt;${o.phone ? ` · ${esc(o.phone)}` : ""}</p>
    ${o.note ? `<p>Note: ${esc(o.note)}</p>` : ""}
    <p>Open your dashboard → Orders to confirm payment and deliver the files.</p>
  `;
}

export function customerOrderEmail(o: { name: string; beatTitle: string; amount: number }): string {
  return `
    <h2>We got your order 🎧</h2>
    <p>Hi ${esc(o.name || "there")}, thanks for ordering <strong>${esc(o.beatTitle)}</strong> (${naira(o.amount)}).</p>
    <p>Ibiga will confirm payment and send your files shortly. You'll get a follow-up email with your download link.</p>
    <p>— Ibiga Beatz</p>
  `;
}

export function orderFulfilledEmail(o: { name: string; beatTitle: string; downloadUrl: string | null }): string {
  return `
    <h2>Your beat is ready 🔥</h2>
    <p>Hi ${esc(o.name || "there")}, <strong>${esc(o.beatTitle)}</strong> is all yours.</p>
    ${
      o.downloadUrl
        ? `<p><a href="${esc(o.downloadUrl)}" style="display:inline-block;background:#1DB954;color:#000;font-weight:600;padding:12px 20px;border-radius:9999px;text-decoration:none">Download your files</a></p>
           <p style="color:#666;font-size:12px">This link expires in 7 days — save your files somewhere safe.</p>`
        : `<p>Ibiga will send your files directly. Reply to this email if you don't hear back soon.</p>`
    }
    <p>— Ibiga Beatz</p>
  `;
}
