import path from 'path';
import fs from 'fs-extra';
import shuffle from 'shuffle-array';
import logger from 'electron-log';
import slash from 'slash';
import { CorrectedFile } from '../packdir/PackDir';

export enum IconType {
    ACTIONS = 'actions',
    PORTRAITS= 'charportraits',
    FAVORS= 'favors',
    ADD_ONS= 'itemaddons',
    ITEMS= 'items',
    STATUS= 'statuseffects',
    PERKS= 'perks',
    POWERS= 'powers',
    BANNERS= 'banners',
    RITUALS= 'dailyrituals',
    EMBLEMS= 'emblems',
    EVENTS= 'events',
    HELP= 'help',
    HELP_LOADING= 'helploading',
    STORE_BG= 'storebackgrounds',
    STORE_TABS= 'storetabs',
    ARCHIVE= 'archive'
};

export class PerkPackArchive {

	constructor(private files: CorrectedFile[]) {
	}

	async getFile(fileName: string): Promise<Buffer> {
		const rawFile = this.files.find((file) => {
			return path.basename(file.newPath.toLowerCase()).endsWith(path.basename(fileName.toLowerCase()));
		});

		if (!rawFile) {
			throw Error(`Could not find file ${fileName}`);
		}

		return fs.promises.readFile(rawFile.originalPath);
	}

	async getTopLevelDirs(): Promise<Set<IconType>> {
		const dirs = new Set<IconType>();
		this.getAllIconFileNames().forEach((file) => {
			const dir = file.newPath.split('/')[0].toLowerCase() as IconType;
			if(!dirs.has(dir)) {
				logger.info(`Adding dir ${dir} to file ${JSON.stringify(file)}`);
				dirs.add(dir);
			}
		});
		return dirs;
	}
	async getRandomIcons(type: IconType, count: number): Promise<Buffer[]> {
		const currentArchive = this;
		const files = this.getIconList(type);
		logger.debug(`Files: `, files);
		shuffle(files);

		if (files.length < count) {
			throw Error(`Not enough files for type ${type}. Toolbox needs at least ${count}.`);
		}

		const randomFiles = files.slice(0, count);
		logger.debug(
			'Getting random icons: ',
			randomFiles
		);
		return Promise.all(
			randomFiles.map((file) => currentArchive.getFile(file.originalPath)),
		);
	}

	async getFavor(name: string): Promise<Buffer> {
		return this.getFile(`iconFavors_${name}.png`);
	}

	async getItemAddon(name: string): Promise<Buffer> {
		return this.getFile(`iconAddon_${name}.png`);
	}

	async getItem(itemName: string): Promise<Buffer> {
		return this.getFile(`iconItems_${itemName}.png`);
	}

	async getStatusEffect(effectName: string): Promise<Buffer> {
		return this.getFile(
			`iconStatusEffects_${effectName}.png`,
		);
	}

	async getPerk(perkName: string): Promise<Buffer> {
		return this.getFile(`iconPerks_${perkName}.png`);
	}

	async getPower(power: string): Promise<Buffer> {
		return this.getFile(`iconPowers_${power}.png`);
	}

	async getPortrait(character: string): Promise<Buffer> {
		return this.getFile(
			`${character}_charSelect_portrait.png`,
		);
	}

	getAllIconFileNames(
		filterFn = (_arg?: any) => {
			return true;
		},
	): CorrectedFile[] {
		return this.files
			.filter((file) => {
				const pathOnly = slash(file.newPath).toLowerCase();
				return filterFn(pathOnly);
			})
	}

	getIconList(type: IconType): CorrectedFile[] {
		return this.getAllIconFileNames((file) =>
			file.includes(`${type}` + '/'),
		);
	}

	async getAvailableTypes(): Promise<IconType[]> {
		const dirs = await this.getTopLevelDirs();
		return [...dirs].filter((dir) =>
			Object.values(IconType).includes(dir),
		);
	}

	async getHas() {
		const dirs = await this.getTopLevelDirs();

		const has = {
			hasActions: dirs.has(IconType.ACTIONS),
			hasPortraits: dirs.has(IconType.PORTRAITS),
			hasFavors: dirs.has(IconType.FAVORS),
			hasItemAddOns: dirs.has(IconType.ADD_ONS),
			hasItems: dirs.has(IconType.ITEMS),
			hasStatusEffects: dirs.has(IconType.STATUS),
			hasPerks: dirs.has(IconType.PERKS),
			hasPowers: dirs.has(IconType.POWERS),
			hasArchive: dirs.has(IconType.ARCHIVE),
			hasBanners: dirs.has(IconType.BANNERS),
			hasRituals: dirs.has(IconType.RITUALS),
			hasEmblems: dirs.has(IconType.EMBLEMS),
			hasEvents: dirs.has(IconType.EVENTS),
			hasHelp: dirs.has(IconType.HELP),
			hasHelpLoading: dirs.has(IconType.HELP_LOADING),
			hasStoreBackgrounds: dirs.has(IconType.STORE_BG),
			hasStoreTabs: dirs.has(IconType.STORE_TABS)
		};

		return has;
	}
}
