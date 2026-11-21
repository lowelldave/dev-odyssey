import type { ProjectCheckpoint, Rule } from '../types';

export interface RuleResult {
  label: string;
  passed: boolean;
  optional: boolean;
  detail: string;
  hint?: string;
}

export interface CheckReport {
  repo: string;
  branch: string;
  fileCount: number;
  results: RuleResult[];
  score: number; // 0-100
  passed: boolean;
  checkedAt: string;
}

const API = 'https://api.github.com';
const IGNORED = /(^|\/)(node_modules|dist|build|\.next|vendor|target|bin|obj|\.venv|venv|__pycache__)\//;
const MAX_FILES_PER_RULE = 25;
const MAX_BLOB_BYTES = 400_000;

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const m =
    trimmed.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/i) ?? trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

class GitHubClient {
  private cache = new Map<string, string | null>();
  constructor(
    private owner: string,
    private repo: string,
    private token?: string,
  ) {}

  private async api(path: string): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const res = await fetch(`${API}${path}`, { headers });
    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      const when = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'later';
      throw new Error(
        `GitHub rate limit reached (60 requests/hour without a token). Try again after ${when}, or add a personal access token in Profile → Settings.`,
      );
    }
    return res;
  }

  async meta() {
    const res = await this.api(`/repos/${this.owner}/${this.repo}`);
    if (res.status === 404) throw new Error('Repository not found. Make sure it exists and is public.');
    if (!res.ok) throw new Error(`GitHub error ${res.status} while reading the repository.`);
    return (await res.json()) as { default_branch: string; description: string | null; homepage: string | null; full_name: string };
  }

  async tree(branch: string): Promise<{ path: string; size: number }[]> {
    const res = await this.api(`/repos/${this.owner}/${this.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    if (!res.ok) throw new Error(`Could not read the file tree (HTTP ${res.status}). Is the repository empty?`);
    const data = (await res.json()) as { tree: { path: string; type: string; size?: number }[] };
    return data.tree
      .filter((t) => t.type === 'blob' && !IGNORED.test(t.path))
      .map((t) => ({ path: t.path, size: t.size ?? 0 }));
  }

  async commitCount(branch: string): Promise<number> {
    const res = await this.api(`/repos/${this.owner}/${this.repo}/commits?per_page=1&sha=${encodeURIComponent(branch)}`);
    if (!res.ok) return 0;
    const link = res.headers.get('link');
    const last = link?.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (last) return Number(last[1]);
    const arr = (await res.json()) as unknown[];
    return arr.length;
  }

  async raw(branch: string, path: string): Promise<string | null> {
    const key = `${branch}:${path}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    let text: string | null = null;
    try {
      const url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${encodeURIComponent(branch)}/${path
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
      const res = await fetch(url);
      text = res.ok ? await res.text() : null;
    } catch {
      text = null;
    }
    this.cache.set(key, text);
    return text;
  }
}

export async function runProjectCheck(
  repoUrl: string,
  checkpoint: ProjectCheckpoint,
  token?: string,
  onProgress?: (msg: string) => void,
): Promise<CheckReport> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error('That does not look like a GitHub repository URL (https://github.com/owner/repo).');
  const gh = new GitHubClient(parsed.owner, parsed.repo, token || undefined);

  onProgress?.('Reading repository…');
  const meta = await gh.meta();
  const branch = meta.default_branch;
  onProgress?.('Mapping files…');
  const files = await gh.tree(branch);
  const paths = files.map((f) => f.path);
  const sizes = new Map(files.map((f) => [f.path, f.size]));

  let commits: number | null = null;
  const results: RuleResult[] = [];

  const match = (re: RegExp) => paths.filter((p) => re.test(p));
  const readable = (p: string) => (sizes.get(p) ?? 0) <= MAX_BLOB_BYTES;

  for (const rule of checkpoint.rules) {
    onProgress?.(`Checking: ${rule.label}`);
    results.push(await evaluate(rule));
  }

  async function evaluate(rule: Rule): Promise<RuleResult> {
    const base = { label: rule.label, optional: !!rule.optional, hint: rule.hint };
    switch (rule.kind) {
      case 'file': {
        const found = match(rule.path);
        return { ...base, passed: found.length > 0, detail: found.length ? `Found ${found.slice(0, 3).join(', ')}` : 'Not found' };
      }
      case 'fileCount': {
        const found = match(rule.path);
        return { ...base, passed: found.length >= rule.min, detail: `Found ${found.length} (need ${rule.min})` };
      }
      case 'contains': {
        const candidates = match(rule.path).filter(readable).slice(0, MAX_FILES_PER_RULE);
        if (!candidates.length) return { ...base, passed: false, detail: 'No matching files to inspect' };
        for (const p of candidates) {
          const text = await gh.raw(branch, p);
          if (text && rule.pattern.test(text)) return { ...base, passed: true, detail: `Matched in ${p}` };
        }
        return { ...base, passed: false, detail: `Pattern not found in ${candidates.length} file(s)` };
      }
      case 'dep': {
        const pkgs = match(/(^|\/)package\.json$/).slice(0, 10);
        if (!pkgs.length) return { ...base, passed: false, detail: 'No package.json found' };
        for (const p of pkgs) {
          const text = await gh.raw(branch, p);
          if (!text) continue;
          try {
            const json = JSON.parse(text) as Record<string, Record<string, string> | undefined>;
            const all = { ...json.dependencies, ...json.devDependencies, ...json.peerDependencies };
            const hit = rule.names.find((n) => n in all);
            if (hit) return { ...base, passed: true, detail: `${hit} in ${p}` };
          } catch {
            /* ignore malformed package.json */
          }
        }
        return { ...base, passed: false, detail: `None of ${rule.names.join(', ')} found` };
      }
      case 'readme': {
        const readme = paths.find((p) => /^readme(\.md|\.markdown|\.rst|\.txt)?$/i.test(p));
        if (!readme) return { ...base, passed: false, detail: 'No README at the repository root' };
        const text = (await gh.raw(branch, readme)) ?? '';
        const headings = (text.match(/^#{1,3}\s+\S/gm) ?? []).length;
        const hasImage = /!\[[^\]]*\]\([^)]+\)|<img\s/i.test(text);
        const ok = text.length >= rule.minLength && headings >= 3 && hasImage;
        return {
          ...base,
          passed: ok,
          detail: `${text.length} chars (need ${rule.minLength}), ${headings} headings (need 3), screenshot: ${hasImage ? 'yes' : 'missing'}`,
        };
      }
      case 'commits': {
        commits ??= await gh.commitCount(branch);
        return { ...base, passed: commits >= rule.min, detail: `${commits} commits` };
      }
      case 'homepage':
        return { ...base, passed: !!meta.homepage, detail: meta.homepage ? meta.homepage : 'Website field is empty' };
      case 'description':
        return { ...base, passed: !!meta.description, detail: meta.description ? `“${meta.description}”` : 'Description is empty' };
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const score = Math.round((passedCount / results.length) * 100);
  const requiredOk = results.every((r) => r.passed || r.optional);
  return {
    repo: meta.full_name,
    branch,
    fileCount: paths.length,
    results,
    score,
    passed: requiredOk && score >= checkpoint.passPercent,
    checkedAt: new Date().toISOString(),
  };
}
