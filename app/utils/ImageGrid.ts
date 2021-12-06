import fs from 'fs-extra';
import logger from 'electron-log';
import { spawn } from 'child_process';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { IconPack } from '../models/IconPack';
import path from 'path';
import getLanguage from '../language/Language';
import slash from 'slash';
import electron from 'electron';
import { CorrectedFile } from '../packdir/PackDir';

const { remote, ipcRenderer } = (electron as any);

const rm = promisify(rimraf)
const magick = path.join(remote.app.getAppPath(), 'dist', 'DbdGalleryGenerator.exe');

async function execPromise(command: string, args: Array<string>, onOutput: (lines: string) => void) {
	ipcRenderer.on('gallery-stdout', (_event: any, output: string) => {
		onOutput(output);
	});
	try {
		await ipcRenderer.invoke('buildGallery', { command, args });
	} finally {
		ipcRenderer.removeAllListeners('gallery-stdout');
	}
}

export default class ImageGrid {
	static async generate(images: CorrectedFile[], onUpdate: (line: string) => void) {
		let imagesWithNames = images.map(image => {
			const name = getLanguage(slash(image.newPath.toLowerCase()));
			return {
				path: image.originalPath,
				name
			}
		});
		imagesWithNames = imagesWithNames.sort(function (a, b) {
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
		}).map(imageWithName => {
			return { ...imageWithName, name: imageWithName.name.split('/').map(entry => entry.trim()).join('\n') }
		});
		const tmpFile = path.resolve(IconPack.tempDir, `${Date.now()}_gallery.png`);
		const tmpSettingsFile = path.resolve(IconPack.tempDir, `${Date.now()}_settings.json`);
		try {
			await fs.promises.writeFile(tmpSettingsFile, JSON.stringify({
				output: tmpFile,
				files: imagesWithNames,
			}));
			await execPromise(magick, [tmpSettingsFile], onUpdate);
		} catch (e: any) {
			onUpdate(e);
			await rm(tmpFile);
		} finally {
			await rm(tmpSettingsFile);
		}

		onUpdate('Generated');
		const galleryImg = await fs.promises.readFile(tmpFile);
		await rm(tmpFile);
		return galleryImg;
	}
}
