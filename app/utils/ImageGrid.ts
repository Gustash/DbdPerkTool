import electron from 'electron';
import logger from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import slash from 'slash';
import { promisify } from 'util';
import getLanguage from '../language/Language';
import { IconPack } from '../models/IconPack';
import { CorrectedFile } from '../packdir/PackDir';

const QUANT_CODE_QUALITY_TOO_BAD = 99;

const { remote, ipcRenderer } = (electron as any);

const rm = promisify(rimraf)
const magick = path.join(remote.app.getAppPath(), 'dist', 'DbdGalleryGenerator.exe');
const quant = path.join(remote.app.getAppPath(), 'dist', 'pngquant.exe');

async function execPromise(command: string, args: Array<string>, onOutput: (lines: string) => void): Promise<number> {
	ipcRenderer.on('gallery-stdout', (_event: any, output: string) => {
		onOutput(output);
	});
	try {
		const code = await ipcRenderer.invoke('buildGallery', { command, args });
		return code;
	} finally {
		ipcRenderer.removeAllListeners('gallery-stdout');
	}
}

async function checkFileExists(file: string): Promise<boolean> {
	return fs.promises.access(file, fs.constants.F_OK)
		.then(() => true)
		.catch(() => false)
}

type NamedImage = {
	path: string;
	name: string;
}
export default class ImageGrid {
	static addNamesToImages(images: CorrectedFile[]) {
		const separateNameIntoLines = (image: NamedImage): NamedImage => {
			return { ...image, name: image.name.split('/').map(entry => entry.trim()).join('\n') }
		};

		const addNameToImage = (image: CorrectedFile): NamedImage => {
			const name = getLanguage(slash(image.newPath.toLowerCase()));
			return {
				path: image.originalPath,
				name
			}
		};

		const sortByName = (a: NamedImage, b: NamedImage) => {
			var nameA = a.name.toUpperCase(); // ignore upper and lowercase
			var nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}

			// names must be equal
			return 0;
		};

		const imagesWithNames = images.map(addNameToImage).sort(sortByName).map(separateNameIntoLines);
		return imagesWithNames;
	}

	static async writeSettings(to: string, outputImg: string, gridName: string, files: NamedImage[]) {
		await fs.promises.writeFile(to, JSON.stringify({
			output: outputImg,
			name: gridName,
			files,
		}));
	}

	static async generate(images: CorrectedFile[], gridName: string, onUpdate: (line: string) => void) {
		const imagesWithNames = ImageGrid.addNamesToImages(images);
		const dateNow = Date.now();
		const tmpFile = path.resolve(IconPack.getTempDir(), `${dateNow}_gallery.png`);
		const compressedTmpFile = path.resolve(IconPack.getTempDir(), `${dateNow}_gallery-new.png`);
		const tmpSettingsFile = path.resolve(IconPack.getTempDir(), `${Date.now()}_settings.json`);
		let finalGalleryImage: Buffer | null = null;
		try {
			await ImageGrid.writeSettings(tmpSettingsFile, tmpFile, gridName, imagesWithNames);
			await execPromise(magick, [tmpSettingsFile], onUpdate);
			onUpdate('Compressing stage 1...');
			const baseQuantOpts = ['--force', '--ext=-new.png'];
			await execPromise(quant, [...baseQuantOpts, '--quality=30-85', tmpFile], onUpdate);

			if (await checkFileExists(compressedTmpFile)) {
				onUpdate(`Using compressed gallery image`);
				finalGalleryImage = await fs.promises.readFile(compressedTmpFile);
			} else if (await checkFileExists(tmpFile)) {
				onUpdate(`Using raw gallery image`);
				finalGalleryImage = await fs.promises.readFile(tmpFile);
			} else {
				throw Error('Unable to find gallery image...');
			}
		} catch (e: any) {
			logger.error(`Error executing promise: ${e}`);
			onUpdate(e.message ?? e.toString());
		} finally {
			await rm(tmpFile);
			await rm(tmpSettingsFile);
			await rm(compressedTmpFile);
		}

		onUpdate('Generated');
		return finalGalleryImage;
	}
}
