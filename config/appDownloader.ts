import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export type Platform = 'android' | 'ios';

const RELEASE = 'https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0';

export const appsDir = path.join(process.cwd(), 'apps');

// The binaries are too large to commit (GitHub rejects files over 100 MB), so they are
// downloaded from the official WebdriverIO native-demo-app release and verified by checksum.
export const APPS: Record<Platform, { fileName: string; url: string; sha256: string }> = {
    android: {
        fileName: 'android.wdio.native.app.apk',
        url: `${RELEASE}/android.wdio.native.app.v2.2.0.apk`,
        sha256: 'fe1d605ce099c73d93f33e5cbcb0df0bea437ce57aaaaf156b3b0fa1ca54931d',
    },
    ios: {
        fileName: 'ios.simulator.wdio.native.app.zip',
        url: `${RELEASE}/ios.simulator.wdio.native.app.v2.2.0.zip`,
        sha256: '84c7efda441f7a8ed37bb1527bae357de8a44a16f878996d52bdfd9d58a8c66a',
    },
};

export function appFilePath(platform: Platform) {
    return path.join(appsDir, APPS[platform].fileName);
}

async function sha256Of(file: string) {
    const hash = crypto.createHash('sha256');
    await pipeline(fs.createReadStream(file), hash);
    return hash.digest('hex');
}

// Downloads the app for the platform unless a valid copy is already in the apps folder.
export async function ensureApp(platform: Platform) {
    const { url, sha256 } = APPS[platform];
    const target = appFilePath(platform);

    if (fs.existsSync(target) && (await sha256Of(target)) === sha256) return target;

    fs.mkdirSync(appsDir, { recursive: true });
    const partial = `${target}.download`;
    console.log(`Downloading ${platform} app from ${url} ...`);

    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(
            `Could not download the ${platform} app (HTTP ${response.status}). ` +
                `Download it manually from ${url} and save it as ${target}, or set ${platform === 'ios' ? 'IOS_APP' : 'ANDROID_APP'}.`,
        );
    }
    await pipeline(Readable.fromWeb(response.body as never), fs.createWriteStream(partial));

    const actual = await sha256Of(partial);
    if (actual !== sha256) {
        fs.rmSync(partial, { force: true });
        throw new Error(`Checksum mismatch for the ${platform} app: expected ${sha256}, got ${actual}.`);
    }
    fs.renameSync(partial, target);
    return target;
}
