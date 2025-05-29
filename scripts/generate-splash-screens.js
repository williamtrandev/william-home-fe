import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS splash screen sizes
const IOS_SPLASH_SIZES = [
	{ width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
	{ width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
	{ width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
	{ width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
	{ width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
	{ width: 828, height: 1792, name: 'apple-splash-828-1792' },
	{ width: 750, height: 1334, name: 'apple-splash-750-1334' },
	{ width: 640, height: 1136, name: 'apple-splash-640-1136' }
];

// Android splash screen sizes
const ANDROID_SPLASH_SIZES = [
	{ width: 1242, height: 2436, name: 'android-splash-1242-2436' }, // Modern phones
	{ width: 1080, height: 1920, name: 'android-splash-1080-1920' }, // Common phones
	{ width: 1440, height: 2560, name: 'android-splash-1440-2560' }, // High-end phones
	{ width: 2048, height: 1536, name: 'android-splash-2048-1536' }, // Tablets
	{ width: 2560, height: 1600, name: 'android-splash-2560-1600' }  // Large tablets
];

const SOURCE_IMAGE = path.join(__dirname, '../public/icons/icon-512x512.png');
const IOS_OUTPUT_DIR = path.join(__dirname, '../public/splash/ios');
const ANDROID_OUTPUT_DIR = path.join(__dirname, '../public/splash/android');

// Create output directories if they don't exist
[IOS_OUTPUT_DIR, ANDROID_OUTPUT_DIR].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});

async function generateSplashScreens() {
	try {
		// Generate iOS splash screens
		console.log('Generating iOS splash screens...');
		for (const size of IOS_SPLASH_SIZES) {
			await sharp(SOURCE_IMAGE)
				.resize(size.width, size.height, {
					fit: 'contain',
					background: { r: 59, g: 130, b: 246, alpha: 1 } // #3b82f6
				})
				.toFile(path.join(IOS_OUTPUT_DIR, `${size.name}.png`));
			console.log(`Generated iOS ${size.name}.png`);
		}

		// Generate Android splash screens
		console.log('\nGenerating Android splash screens...');
		for (const size of ANDROID_SPLASH_SIZES) {
			await sharp(SOURCE_IMAGE)
				.resize(size.width, size.height, {
					fit: 'contain',
					background: { r: 59, g: 130, b: 246, alpha: 1 } // #3b82f6
				})
				.toFile(path.join(ANDROID_OUTPUT_DIR, `${size.name}.png`));
			console.log(`Generated Android ${size.name}.png`);
		}

		console.log('\nAll splash screens generated successfully!');
	} catch (error) {
		console.error('Error generating splash screens:', error);
	}
}

generateSplashScreens(); 