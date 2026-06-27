/**
 * Emails the producer via Resend. No-ops unless RESEND_API_KEY, RESEND_FROM and
 * PRODUCER_NOTIFY_EMAIL are set, and never throws — notifications must not break
 * a visitor's form submission.
 */
export async function notifyProducer(subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.PRODUCER_NOTIFY_EMAIL;
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
