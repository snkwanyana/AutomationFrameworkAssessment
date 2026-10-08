# Capitec Bank Automation Framework

Mobile (Android and iOS) UI automation and REST API automation for the assessment.

## Technology

| Area | Tool |
| --- | --- |
| Mobile test runner | [WebdriverIO](https://webdriver.io) 10 with Mocha (BDD) |
| Mobile driver | [Appium](https://appium.io) 3 - UiAutomator2 (Android), XCUITest (iOS) |
| API tests | [Playwright Test](https://playwright.dev) (`request` fixture) against restful-booker |
| Language | TypeScript |
| Reporting | Custom Extent-style HTML report (mobile), Playwright HTML report (API) |
| Design pattern | Page Object Model with shared utilities |

## Project structure

```
.
├── apps/                              # App binaries (git-ignored, downloaded automatically)
├── config/
│   ├── wdio.conf.ts                   # WebdriverIO config, platform capabilities (PLATFORM=android|ios)
│   ├── playwright.api.config.ts       # Playwright config for the API tests
│   ├── appDownloader.ts               # Downloads + checksum-verifies the demo apps into apps/
│   └── reporters/                     # Extent-style report (reporter, HTML generator, event helpers)
├── tests/
│   ├── pageobjects/                   # Mobile page objects (Login, Signup, Forms, Swipe, Drag)
│   ├── specs/
│   │   ├── mobile/                    # *.e2e.ts mobile specs (shared across platforms)
│   │   └── api/                       # *.spec.ts API specs (auth, booking)
│   └── utils/                         # Gestures, mobile test data, API test data
├── reports/
│   ├── mobile/<platform>/             # ExtentReport.html + screenshots
│   └── api/                           # Playwright HTML report
├── scripts/setupApps.ts               # npm run setup:apps
├── package.json
└── tsconfig.json
```

## Prerequisites

- [Node.js](https://nodejs.org) 20 or later and npm
- Internet access (the API tests call `https://restful-booker.herokuapp.com`)

**Android**
- Android Studio / Android SDK with `ANDROID_HOME` set and `platform-tools` on `PATH`
- JDK 17 or later with `JAVA_HOME` set
- A running emulator or connected device (check with `adb devices`)

**iOS** (macOS only)
- Xcode with command line tools and an iOS simulator

## Install

```
npm install
npm run setup:apps
```

For iOS, also install the XCUITest driver (the UiAutomator2 driver is already a dependency):

```
npx appium driver install xcuitest
```

### App binaries

The apps under test (WebdriverIO native demo app v2.2.0) are not committed because the APK is larger than GitHub's
100 MB file limit. They are downloaded into `apps/` and checksum-verified automatically on the first mobile run.
To fetch them up front (e.g. on CI), run:

```
npm run setup:apps
```

## Run tests

### API

```
npm run test:api
```

Optional: set `BOOKER_BASE_URL` to target a different server. The HTML report is written to `reports/api`
(open it with `npx playwright show-report reports/api`).

### Android

Start an emulator or connect a device, then:

```
npm run test:android
```

### iOS

Boot a simulator on macOS, then:

```
npm run test:ios
```

`PLATFORM=android|ios` selects the capabilities in `config/wdio.conf.ts`; Android is the default. Defaults can be
overridden with environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `ANDROID_DEVICE_NAME` | Android device name | `Android Emulator` |
| `ANDROID_PLATFORM_VERSION` | Android version | not set |
| `ANDROID_APP` | Path to the `.apk` | `apps/android.wdio.native.app.apk` |
| `IOS_DEVICE_NAME` | Simulator name | `iPhone 15` |
| `IOS_PLATFORM_VERSION` | iOS version | `17.5` |
| `IOS_APP` | Path to the simulator `.zip`/`.app` | `apps/ios.simulator.wdio.native.app.zip` |

Note: the page objects currently use Android locators, so the iOS run needs iOS equivalents before the specs pass.

### Extent-style HTML report

After each mobile run a single self-contained report is written to
`reports/mobile/<platform>/ExtentReport.html` with:

- dashboard (pass/fail/skip totals, environment details) and status/search filters
- per-test log of steps and Appium commands (add your own with `reportLog.info(...)` from `config/reporters/reportEvents.ts`)
- a screenshot after every test, embedded in the report
- the last 200 device log lines (logcat / syslog) for failed tests and the error stack trace

## Why I chose Drag and Drop Puzzle

I selected this scenario because it validates a more advanced mobile interaction compared to standard form entry or navigation flows. Drag and drop functionality is commonly used in modern mobile applications and requires accurate gesture handling.

Automating this scenario demonstrates:

- Advanced Appium gesture capabilities
- Touch action and coordinate-based interactions
- Complex user behaviour simulation
- End-to-end validation of interactive UI components
- Ability to automate beyond simple tap and input actions

