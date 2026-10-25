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

const REPORT_PATH = 'arb-last-discovery.json';

/** The feeds that were found before, so a scan can use them without hunting again. */
export async function readKnownFeeds(env = {}) {
  const repo = env.ARB_REPORT_REPO;
  const branch = env.ARB_REPORT_BRANCH || DEFAULT_BRANCH;
  if (!repo) return {};
  try {
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${REPORT_PATH}`, {
      headers: { 'User-Agent': 'bryme-lab', Accept: 'application/json' },
    });
    if (!response.ok) return {};
    const report = await response.json();
    const known = {};
    for (const entry of (report.results || [])) {
      if (entry.status === 'found' && entry.url) known[entry.id] = { url: entry.url, quoteCount: entry.quoteCount, at: report.at };
    }
    return known;
  } catch {
    return {};
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

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'bryme-lab',
  };
  try {
    const path = `https://api.github.com/repos/${repo}/contents/${REPORT_PATH}`;
    // Updating a file needs its current sha, so read it first.
    let sha = '';
    // the extra facts (which country the worker reached the books from) are
    // kept too - they explain a refusal better than any error message
    const extras = { ...extra };
    delete extras.trigger;
    const merged = { at: report.at, edge: report.edge, ...extras, results: [...results] };
    try {
      const existing = await fetch(`${path}?ref=${encodeURIComponent(branch)}`, { headers });
      if (existing.ok) {
        const body = await existing.json();
        sha = body?.sha || '';
        if (body?.content) {
          const previous = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'));
          const byId = new Map((previous.results || []).map((entry) => [entry.id, entry]));
          for (const entry of results) {
            const previousEntry = byId.get(entry.id);
            if (previousEntry) {
              // keep every attempt ever made for this book, and keep the
              // better of the two answers
              const attempts = [...(previousEntry.attempts || [])];
              const seen = new Set(attempts.map((a) => a.url));
              for (const attempt of entry.attempts || []) {
                if (!seen.has(attempt.url)) { attempts.push(attempt); seen.add(attempt.url); }
              }
              const found = [previousEntry, entry].find((e) => e.status === 'found');
              byId.set(entry.id, {
                ...previousEntry,
                ...entry,
                status: found ? 'found' : entry.status,
                url: found ? found.url : entry.url,
                quoteCount: Math.max(previousEntry.quoteCount || 0, entry.quoteCount || 0),
                attempts: attempts.slice(-40),
              });
            } else {
              byId.set(entry.id, entry);
            }
          }
          merged.results = [...byId.values()];
          merged.at = report.at;
        }
      }
    } catch { /* a missing file simply means there is no sha */ }

    const payload = {
      message: `lab: discovery report ${report.at}`,
      content: Buffer.from(JSON.stringify(merged, null, 1)).toString('base64'),
      branch,
    };
    if (sha) payload.sha = sha;

    const response = await fetch(path, { method: 'PUT', headers, body: JSON.stringify(payload) });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { sent: false, reason: `GitHub said ${response.status}: ${detail.slice(0, 200)}` };
    }
    return { sent: true, updated: Boolean(sha) };
  } catch (error) {
    return { sent: false, reason: error?.message || 'report failed' };
  }
}

export { readLocalReport };
