import { ensureApp, type Platform } from '../config/appDownloader';

// Usage: tsx scripts/setupApps.ts [android] [ios]   (defaults to both)
async function main() {
    const requested = process.argv.slice(2) as Platform[];
    const platforms: Platform[] = requested.length ? requested : ['android', 'ios'];

    for (const platform of platforms) {
        console.log(`${platform}: ${await ensureApp(platform)}`);
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
