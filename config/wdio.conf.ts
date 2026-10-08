import fs from 'node:fs';
import path from 'node:path';
import { appFilePath, ensureApp } from './appDownloader';
import ExtentReporter from './reporters/ExtentReporter';
import { generateExtentReport } from './reporters/extentReport';
import { emitReportEvent } from './reporters/reportEvents';

type Platform = 'android' | 'ios';

const platform = (process.env.PLATFORM ?? 'android').toLowerCase() as Platform;

if (platform !== 'android' && platform !== 'ios') {
    throw new Error(`Unsupported PLATFORM "${process.env.PLATFORM}". Use "android" or "ios".`);
}

const reportDir = path.join(process.cwd(), 'reports', 'mobile', platform);
const screenshotDir = path.join(reportDir, 'screenshots');

// Platform-specific capabilities. Every value can be overridden through environment variables.
const platformCapabilities: Record<Platform, WebdriverIO.Capabilities> = {
    android: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
        ...(process.env.ANDROID_PLATFORM_VERSION && {
            'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION,
        }),
        'appium:app': process.env.ANDROID_APP ?? appFilePath('android'),
    },
    ios: {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone 15',
        'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? '17.5',
        'appium:app': process.env.IOS_APP ?? appFilePath('ios'),
        'appium:autoAcceptAlerts': false,
        'appium:wdaLaunchTimeout': 120000,
    },
};

// Capabilities shared by both platforms.
const commonCapabilities: WebdriverIO.Capabilities = {
    'appium:newCommandTimeout': 240,
};

export const config: WebdriverIO.Config = {
    runner: 'local',
    specs: ['../tests/specs/**/*.e2e.ts'],
    maxInstances: 1,
    port: 4723,
    services: [['appium', { command: 'appium' }]],
    capabilities: [{
        ...commonCapabilities,
        ...platformCapabilities[platform],
    }],
    logLevel: 'info',
    framework: 'mocha',
    reporters: ['spec', [ExtentReporter, { outputDir: reportDir }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    // Fetches the app binary on first run (it is not committed because of its size).
    async onPrepare() {
        const appOverride = platform === 'ios' ? process.env.IOS_APP : process.env.ANDROID_APP;
        if (!appOverride) await ensureApp(platform);
        fs.rmSync(reportDir, { recursive: true, force: true });
        fs.mkdirSync(screenshotDir, { recursive: true });
    },

    // Captures a screenshot after every test, plus device logs when it failed.
    async afterTest(test, _context, { passed }) {
        try {
            const name = `${test.title}-${Date.now()}`.replace(/[^a-z0-9]+/gi, '_');
            const file = path.join(screenshotDir, `${name}.png`);
            await driver.saveScreenshot(file);
            emitReportEvent({ type: 'screenshot', title: passed ? 'Test passed' : 'Test failed', file });

            if (!passed) {
                const logType = platform === 'ios' ? 'syslog' : 'logcat';
                const entries = await driver.getLogs(logType);
                const lines = (entries as { timestamp?: number; message: string }[])
                    .slice(-200)
                    .map((entry) => entry.message);
                emitReportEvent({ type: 'deviceLogs', lines });
            }
        } catch (error) {
            emitReportEvent({ type: 'log', level: 'warn', message: `Could not capture report artifacts: ${error}` });
        }
    },

    onComplete() {
        const file = generateExtentReport({ title: 'Capitec Bank Mobile Automation Report', platform, outputDir: reportDir });
        console.log(`Extent report generated: ${file}`);
    },
};
