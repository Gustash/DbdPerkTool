import fs from 'fs-extra';
import logger from 'electron-log';
import { exec } from 'child_process';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { IconPack } from '../models/IconPack';
import path from 'path';
import getLanguage from '../language/Language';
import slash from 'slash';
import electron from 'electron';
import { CorrectedFile } from '../packdir/PackDir';

const { remote } = (electron as any);

const rm = promisify(rimraf)
const magick = path.join(remote.app.getAppPath(), 'dist', 'DbdGalleryGenerator.exe');

export default class ImageGrid {
	static async generate(images: CorrectedFile[]) {
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
		const execPromise = promisify(exec);
		const tmpFile = path.resolve(IconPack.tempDir, `${Date.now()}_gallery.png`);
		const tmpSettingsFile = path.resolve(IconPack.tempDir, `${Date.now()}_settings.json`);
		try {
			await fs.promises.writeFile(tmpSettingsFile, JSON.stringify({
				output: tmpFile,
				files: imagesWithNames,
			}));
			const cmd = `"${magick}" "${tmpSettingsFile}"`;
			logger.info(`Executing cmd ${cmd}`);
			const { stdout, stderr } = await execPromise(cmd);
			logger.info(stdout);
			logger.info(stderr);
		} catch (e: any) {
			const { stdout, stderr } = e;
			logger.error(e);
			logger.error(stdout);
			logger.error(stderr);
			await rm(tmpFile);
		} finally {
			await rm(tmpSettingsFile);
		}

		logger.info('Generated');
		const galleryImg = await fs.promises.readFile(tmpFile);
		await rm(tmpFile);
		return galleryImg;
	}
}
