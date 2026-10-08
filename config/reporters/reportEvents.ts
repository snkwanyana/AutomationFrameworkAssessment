import type { EventEmitter } from 'node:events';

export type TestStatus = 'passed' | 'failed' | 'skipped';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    time: string;
    level: LogLevel;
    message: string;
}

export interface ScreenshotEntry {
    title: string;
    file: string;
    time: string;
}

export interface TestRecord {
    uid: string;
    suite: string;
    title: string;
    status: TestStatus;
    start: string;
    end: string;
    duration: number;
    error?: string;
    stack?: string;
    logs: LogEntry[];
    deviceLogs: string[];
    screenshots: ScreenshotEntry[];
}

export interface RunnerRecord {
    cid: string;
    specs: string[];
    sessionId: string;
    capabilities: Record<string, unknown>;
    start: string;
    end: string;
    tests: TestRecord[];
}

export type ReportEvent =
    | { type: 'log'; level: LogLevel; message: string }
    | { type: 'screenshot'; title: string; file: string }
    | { type: 'deviceLogs'; lines: string[] };

const EVENT_NAME = 'extent:event';

// Hooks and specs run in the same worker process as the reporter, so a process-level event is enough.
export function emitReportEvent(event: ReportEvent) {
    (process as unknown as EventEmitter).emit(EVENT_NAME, event);
}

export function onReportEvent(listener: (event: ReportEvent) => void) {
    (process as unknown as EventEmitter).on(EVENT_NAME, listener);
}

// Lets specs and page objects add custom steps to the current test's log.
export const reportLog = {
    info: (message: string) => emitReportEvent({ type: 'log', level: 'info', message }),
    warn: (message: string) => emitReportEvent({ type: 'log', level: 'warn', message }),
    error: (message: string) => emitReportEvent({ type: 'log', level: 'error', message }),
    debug: (message: string) => emitReportEvent({ type: 'log', level: 'debug', message }),
};
