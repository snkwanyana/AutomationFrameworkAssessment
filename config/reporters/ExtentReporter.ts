import fs from 'node:fs';
import path from 'node:path';
import WDIOReporter, {
    type AfterCommandArgs,
    type BeforeCommandArgs,
    type HookStats,
    type RunnerStats,
    type TestStats,
} from '@wdio/reporter';
import {
    onReportEvent,
    type LogEntry,
    type LogLevel,
    type ReportEvent,
    type RunnerRecord,
    type TestRecord,
} from './reportEvents';

export interface ExtentReporterOptions {
    outputDir: string;
}

const MAX_BODY_LENGTH = 200;

function truncate(value: string, max = MAX_BODY_LENGTH) {
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

function describeCommand({ method, endpoint, body, sessionId }: BeforeCommandArgs) {
    const url = (endpoint ?? '').replace(sessionId, ':session');
    const payload = body && Object.keys(body as object).length ? ` ${truncate(JSON.stringify(body))}` : '';
    return `${method ?? ''} ${url}${payload}`.trim();
}

// Collects per-test data (steps, Appium commands, screenshots, device logs) and writes it as JSON
// for the final report to be generated from once every worker has finished.
export default class ExtentReporter extends WDIOReporter {
    private readonly dataDir: string;
    private readonly records = new Map<string, TestRecord>();
    private current?: TestRecord;
    // Commands issued by beforeEach hooks run before the test itself is announced.
    private pendingLogs: LogEntry[] = [];
    private inBeforeHook = false;

    constructor(options: Partial<ExtentReporterOptions>) {
        super(options as never);
        this.dataDir = path.join((options as ExtentReporterOptions).outputDir, 'data');
        fs.mkdirSync(this.dataDir, { recursive: true });
        onReportEvent((event) => this.handleEvent(event));
    }

    onHookStart(hook: HookStats) {
        this.inBeforeHook = /before/i.test(hook.title);
    }

    onHookEnd(hook: HookStats) {
        this.inBeforeHook = false;
        if (hook.error) {
            const record = this.upsert(hook.uid, hook.title, hook.parent ?? '');
            record.status = 'failed';
            record.error = hook.error.message;
            record.stack = hook.error.stack;
            this.finish(record, hook.start, hook.end, hook.duration);
        }
    }

    onTestStart(test: TestStats) {
        const record = this.upsert(test.uid, test.title, test.parent);
        record.logs.push(...this.pendingLogs);
        this.pendingLogs = [];
        this.inBeforeHook = false;
        this.current = record;
        this.addLog(`Test started: ${test.fullTitle}`, 'info');
    }

    onBeforeCommand(command: BeforeCommandArgs) {
        this.addLog(describeCommand(command), 'debug');
    }

    onAfterCommand(command: AfterCommandArgs) {
        const value = (command.result as { value?: { error?: string; message?: string } } | undefined)?.value;
        if (value && typeof value === 'object' && value.error) {
            this.addLog(`${value.error}: ${truncate(value.message ?? '')}`, 'warn');
        }
    }

    onTestEnd(test: TestStats) {
        const record = this.upsert(test.uid, test.title, test.parent);
        record.status = test.state === 'passed' ? 'passed' : test.state === 'failed' ? 'failed' : 'skipped';
        const error = test.error ?? test.errors?.[0];
        if (error) {
            record.error = error.message;
            record.stack = error.stack;
            this.addLog(error.message, 'error', record);
        }
        this.addLog(`Test ${record.status}`, record.status === 'failed' ? 'error' : 'info', record);
        this.finish(record, test.start, test.end, test.duration);
    }

    onTestSkip(test: TestStats) {
        const record = this.upsert(test.uid, test.title, test.parent);
        record.status = 'skipped';
        this.finish(record, test.start, test.end ?? test.start, test.duration);
    }

    onRunnerEnd(runner: RunnerStats) {
        const data: RunnerRecord = {
            cid: runner.cid,
            specs: runner.specs,
            sessionId: runner.sessionId,
            capabilities: runner.capabilities as Record<string, unknown>,
            start: runner.start.toISOString(),
            end: (runner.end ?? new Date()).toISOString(),
            tests: [...this.records.values()],
        };
        fs.writeFileSync(path.join(this.dataDir, `${runner.cid}.json`), JSON.stringify(data, null, 2));
    }

    private upsert(uid: string, title: string, suite: string) {
        let record = this.records.get(uid);
        if (!record) {
            record = {
                uid,
                suite,
                title,
                status: 'skipped',
                start: new Date().toISOString(),
                end: new Date().toISOString(),
                duration: 0,
                logs: [],
                deviceLogs: [],
                screenshots: [],
            };
            this.records.set(uid, record);
        }
        return record;
    }

    private finish(record: TestRecord, start: Date, end: Date | undefined, duration: number) {
        record.start = start.toISOString();
        record.end = (end ?? new Date()).toISOString();
        record.duration = duration;
    }

    private addLog(message: string, level: LogLevel, explicitTarget?: TestRecord) {
        const target = explicitTarget ?? this.current;
        const entry: LogEntry = { time: new Date().toISOString(), level, message };
        if (this.inBeforeHook && !explicitTarget) {
            this.pendingLogs.push(entry);
        } else if (target) {
            target.logs.push(entry);
        }
    }

    private handleEvent(event: ReportEvent) {
        if (event.type === 'log') {
            this.addLog(event.message, event.level);
            return;
        }
        if (!this.current) return;
        if (event.type === 'screenshot') {
            this.current.screenshots.push({ title: event.title, file: event.file, time: new Date().toISOString() });
        } else {
            this.current.deviceLogs.push(...event.lines);
        }
    }
}
