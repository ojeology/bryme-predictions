/**
 * Sending the discovery report back to the operator.
 *
 * The person using the lab may be on a phone with no terminal, so the Worker
 * writes what it found to a private branch in the repository instead of
 * making them read it off a screen and copy it back by hand.
 *
 * Nothing is ever sent anywhere else: the report is written with a token the
 * operator gave the Worker, into a branch that nothing deploys from.
 */
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BRANCH = 'lab-reports';

function readLocalReport() {
  try {
    const file = path.join(process.cwd(), 'arb', 'last-discovery.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Write the report to the operator's repository branch. Best effort. */
export async function reportDiscovery(env = {}, results = [], extra = {}) {
  const report = {
    at: new Date().toISOString(),
    edge: extra.edge || null,
    results,
    ...extra,
  };

  // always keep a copy on the Worker machine (the local dev server)
  try {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    mkdirSync(path.join(process.cwd(), 'arb'), { recursive: true });
    writeFileSync(path.join(process.cwd(), 'arb', 'last-discovery.json'), JSON.stringify(report, null, 1));
  } catch { /* not fatal */ }

  const token = env.ARB_REPORT_TOKEN;
  const repo = env.ARB_REPORT_REPO;
  const branch = env.ARB_REPORT_BRANCH || DEFAULT_BRANCH;
  if (!token || !repo) return { sent: false, reason: 'no report token configured' };

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/arb-last-discovery.json`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'bryme-lab',
      },
      body: JSON.stringify({
        message: `lab: discovery report ${report.at}`,
        content: Buffer.from(JSON.stringify(report, null, 1)).toString('base64'),
        branch,
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { sent: false, reason: `GitHub said ${response.status}: ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error?.message || 'report failed' };
  }
}

export { readLocalReport };
