import fs from 'node:fs';
import path from 'node:path';
import type { LogEntry, RunnerRecord, TestRecord, TestStatus } from './reportEvents';

export interface ReportInfo {
    title: string;
    platform: string;
    outputDir: string;
}

const esc = (value: unknown) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const fmtDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`);
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour12: false });

function readRunners(dataDir: string): RunnerRecord[] {
    if (!fs.existsSync(dataDir)) return [];
    return fs
        .readdirSync(dataDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as RunnerRecord)
        .sort((a, b) => a.start.localeCompare(b.start));
}

function imageSrc(file: string) {
    if (!fs.existsSync(file)) return undefined;
    return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
}

function renderLogs(logs: LogEntry[]) {
    if (!logs.length) return '<p class="muted">No log entries.</p>';
    return `<table class="logs">${logs
        .map(
            (l) =>
                `<tr class="lvl-${l.level}"><td class="t">${fmtTime(l.time)}</td><td class="l">${l.level.toUpperCase()}</td><td class="m">${esc(l.message)}</td></tr>`,
        )
        .join('')}</table>`;
}

function renderTest(test: TestRecord) {
    const shots = test.screenshots
        .map((s) => {
            const src = imageSrc(s.file);
            return src
                ? `<figure><a href="${src}" target="_blank"><img src="${src}" alt="${esc(s.title)}"></a><figcaption>${esc(s.title)} · ${fmtTime(s.time)}</figcaption></figure>`
                : '';
        })
        .join('');
    const error = test.error
        ? `<div class="error"><strong>${esc(test.error)}</strong><pre>${esc(test.stack ?? '')}</pre></div>`
        : '';
    const device = test.deviceLogs.length
        ? `<details><summary>Device logs (${test.deviceLogs.length} lines)</summary><pre class="device">${esc(test.deviceLogs.join('\n'))}</pre></details>`
        : '';
    return `
    <div class="test ${test.status}" data-status="${test.status}" data-name="${esc(`${test.suite} ${test.title}`.toLowerCase())}">
        <div class="test-head" onclick="this.parentElement.classList.toggle('open')">
            <span class="badge ${test.status}">${test.status}</span>
            <span class="title">${esc(test.title)}</span>
            <span class="meta">${fmtTime(test.start)} · ${fmtDuration(test.duration)}</span>
        </div>
        <div class="test-body">
            ${error}
            <h4>Logs</h4>${renderLogs(test.logs)}
            ${device}
            <h4>Screenshots</h4><div class="shots">${shots || '<p class="muted">No screenshots.</p>'}</div>
        </div>
    </div>`;
}

function donut(counts: Record<TestStatus, number>, total: number) {
    const colors: Record<TestStatus, string> = { passed: '#2e9e5b', failed: '#d9435a', skipped: '#e0a526' };
    const r = 40;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const arcs = (Object.keys(counts) as TestStatus[])
        .filter((s) => counts[s] > 0)
        .map((s) => {
            const len = (counts[s] / total) * c;
            const arc = `<circle r="${r}" cx="60" cy="60" fill="none" stroke="${colors[s]}" stroke-width="18" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`;
            offset += len;
            return arc;
        })
        .join('');
    return `<svg viewBox="0 0 120 120" width="120" height="120">${total ? arcs : `<circle r="${r}" cx="60" cy="60" fill="none" stroke="#ccc" stroke-width="18"/>`}</svg>`;
}

const CSS = `
:root{--bg:#f4f6f9;--card:#fff;--text:#263238;--muted:#78909c;--border:#e3e8ee;--pass:#2e9e5b;--fail:#d9435a;--skip:#e0a526;--side:#263445}
body.dark{--bg:#1c2430;--card:#252f3d;--text:#e3e8ee;--muted:#9aa7b4;--border:#344155}
*{box-sizing:border-box}body{margin:0;font-family:Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
aside{width:220px;background:var(--side);color:#fff;padding:20px 16px;position:sticky;top:0;height:100vh}
aside h1{font-size:18px;margin:0 0 4px}aside p{font-size:12px;color:#9fb0c3;margin:0 0 24px}
aside a{display:block;color:#cfd8e3;text-decoration:none;padding:8px 10px;border-radius:4px;font-size:14px;cursor:pointer}aside a:hover{background:#34475d}
main{flex:1;padding:24px;max-width:1200px}
.cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.card{background:var(--card);border:1px solid var(--border);border-radius:6px;padding:16px;flex:1;min-width:200px}
.card h3{margin:0 0 10px;font-size:13px;text-transform:uppercase;color:var(--muted);letter-spacing:.5px}
.big{font-size:32px;font-weight:600}.pass{color:var(--pass)}.fail{color:var(--fail)}.skip{color:var(--skip)}
.chart{display:flex;align-items:center;gap:16px}.chart ul{list-style:none;margin:0;padding:0;font-size:14px}
.chart li:before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;background:var(--c)}
table.sys{width:100%;font-size:13px;border-collapse:collapse}table.sys td{padding:4px 0;border-bottom:1px solid var(--border)}table.sys td:first-child{color:var(--muted);width:40%}
.toolbar{display:flex;gap:8px;margin:16px 0;align-items:center;flex-wrap:wrap}
.toolbar button,.toolbar input{padding:6px 12px;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:4px;font-size:13px;cursor:pointer}
.toolbar button.active{background:var(--side);color:#fff}.toolbar input{cursor:text;margin-left:auto;min-width:220px}
.suite{background:var(--card);border:1px solid var(--border);border-radius:6px;margin-bottom:16px;overflow:hidden}
.suite>h2{margin:0;padding:12px 16px;font-size:15px;border-bottom:1px solid var(--border)}.suite>h2 small{color:var(--muted);font-weight:normal;margin-left:8px}
.test{border-bottom:1px solid var(--border);border-left:4px solid transparent}.test:last-child{border-bottom:0}
.test.passed{border-left-color:var(--pass)}.test.failed{border-left-color:var(--fail)}.test.skipped{border-left-color:var(--skip)}
.test-head{display:flex;gap:12px;align-items:center;padding:10px 16px;cursor:pointer}.test-head:hover{background:rgba(127,127,127,.08)}
.title{flex:1;font-size:14px}.meta{font-size:12px;color:var(--muted)}
.badge{font-size:11px;text-transform:uppercase;color:#fff;padding:2px 8px;border-radius:10px}
.badge.passed{background:var(--pass)}.badge.failed{background:var(--fail)}.badge.skipped{background:var(--skip)}
.test-body{display:none;padding:4px 16px 16px}.test.open .test-body{display:block}.test-body h4{margin:16px 0 8px;font-size:13px;color:var(--muted);text-transform:uppercase}
table.logs{width:100%;border-collapse:collapse;font:12px Consolas,monospace}table.logs td{padding:3px 8px;border-bottom:1px solid var(--border);vertical-align:top}
td.t{color:var(--muted);white-space:nowrap;width:70px}td.l{width:60px;font-weight:600}td.m{word-break:break-all}
.lvl-error td.l,.lvl-error td.m{color:var(--fail)}.lvl-warn td.l,.lvl-warn td.m{color:var(--skip)}.lvl-debug td.m{color:var(--muted)}
.error{background:rgba(217,67,90,.1);border:1px solid var(--fail);border-radius:4px;padding:10px;margin-top:8px}
pre{white-space:pre-wrap;word-break:break-word;font:12px Consolas,monospace;margin:6px 0 0}pre.device{max-height:300px;overflow:auto;background:rgba(127,127,127,.1);padding:8px}
.shots{display:flex;gap:12px;flex-wrap:wrap}.shots figure{margin:0;width:200px}.shots img{width:100%;border:1px solid var(--border);border-radius:4px}
figcaption{font-size:12px;color:var(--muted);margin-top:4px}.muted{color:var(--muted);font-size:13px}
details summary{cursor:pointer;margin-top:12px;font-size:13px}
`;

const JS = `
const q=document.getElementById('q');let status='all';
function apply(){const term=q.value.toLowerCase();
document.querySelectorAll('.test').forEach(t=>{t.style.display=(status==='all'||t.dataset.status===status)&&t.dataset.name.includes(term)?'':'none'});
document.querySelectorAll('.suite').forEach(s=>{s.style.display=[...s.querySelectorAll('.test')].some(t=>t.style.display!=='none')?'':'none'})}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{status=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));apply()});
q.oninput=apply;
document.getElementById('theme').onclick=()=>document.body.classList.toggle('dark');
document.querySelectorAll('.test.failed').forEach(t=>t.classList.add('open'));
`;

export function generateExtentReport({ title, platform, outputDir }: ReportInfo) {
    const runners = readRunners(path.join(outputDir, 'data'));
    const tests = runners.flatMap((r) => r.tests);
    const counts: Record<TestStatus, number> = { passed: 0, failed: 0, skipped: 0 };
    tests.forEach((t) => counts[t.status]++);
    const total = tests.length;
    const start = runners.length ? runners[0].start : new Date().toISOString();
    const end = runners.length ? runners.map((r) => r.end).sort().at(-1)! : start;
    const caps = (runners[0]?.capabilities ?? {}) as Record<string, unknown>;
    const cap = (key: string) => String(caps[key] ?? caps[`appium:${key}`] ?? '');
    const passRate = total ? Math.round((counts.passed / total) * 100) : 0;

    const bySuite = new Map<string, TestRecord[]>();
    tests.forEach((t) => bySuite.set(t.suite, [...(bySuite.get(t.suite) ?? []), t]));
    const suites = [...bySuite.entries()]
        .map(
            ([name, list]) =>
                `<section class="suite"><h2>${esc(name || 'Tests')}<small>${list.length} test(s)</small></h2>${list.map(renderTest).join('')}</section>`,
        )
        .join('');

    const sysRows = [
        ['Platform', platform],
        ['Device', [cap('deviceManufacturer'), cap('deviceModel')].filter(Boolean).join(' ') || cap('deviceName')],
        ['Device ID', cap('deviceUDID') || cap('udid')],
        ['Platform version', cap('platformVersion')],
        ['Automation', cap('automationName')],
        ['Node', process.version],
        ['Started', new Date(start).toLocaleString('en-GB')],
        ['Duration', fmtDuration(new Date(end).getTime() - new Date(start).getTime())],
    ]
        .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`)
        .join('');

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head>
<body>
<aside><h1>${esc(title)}</h1><p>${esc(platform.toUpperCase())} · ${new Date(start).toLocaleDateString('en-GB')}</p>
<a onclick="window.scrollTo(0,0)">Dashboard</a><a onclick="document.getElementById('tests').scrollIntoView()">Tests</a><a id="theme">Toggle theme</a></aside>
<main>
<div class="cards">
<div class="card"><h3>Tests</h3><div class="big">${total}</div><div class="muted">Pass rate ${passRate}%</div></div>
<div class="card"><h3>Results</h3><div class="chart">${donut(counts, total)}<ul>
<li style="--c:var(--pass)">${counts.passed} passed</li><li style="--c:var(--fail)">${counts.failed} failed</li><li style="--c:var(--skip)">${counts.skipped} skipped</li></ul></div></div>
<div class="card"><h3>Environment</h3><table class="sys">${sysRows}</table></div>
</div>
<div class="toolbar" id="tests">
<button class="active" data-filter="all">All</button><button data-filter="passed">Passed</button><button data-filter="failed">Failed</button><button data-filter="skipped">Skipped</button>
<input id="q" placeholder="Search tests…">
</div>
${suites || '<p class="muted">No test results were recorded.</p>'}
</main><script>${JS}</script></body></html>`;

    const file = path.join(outputDir, 'ExtentReport.html');
    fs.writeFileSync(file, html);
    return file;
}
