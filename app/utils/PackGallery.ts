import ImageGrid from './ImageGrid';
import logger from 'electron-log';
import { CorrectedFile } from '../packdir/PackDir';
import { IconType, PerkPackArchive } from '../models/PerkPackArchive';

export default class PackGallery {

	constructor(private archive: PerkPackArchive) {
	}

	public async create() {
		const types = await this.archive.getAvailableTypes();
		const images = await this.buildUncompressedImages(types);
		return images;
	}

	private async buildUncompressedImages(types: IconType[]) {
		const images = [];
		for (let i = 0; i < types.length; i += 1) {
			logger.info(`Processing images for type ${types[i]}`);
			const type = types[i];
			const files = this.archive.getIconList(type);
			if (files.length > 0) {
				console.log(`Type: ${type}: `, files);
				images.push(await this.generateImageFor(type, files));
			}
		}
		return images;
	}

	private async generateImageFor(type: IconType, files: CorrectedFile[]) {
		const img = await ImageGrid.generate(files);
		return { type, data: img };
	}

}
