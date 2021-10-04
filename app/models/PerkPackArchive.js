import unzipper from 'unzipper';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs-extra';
import shuffle from 'shuffle-array';
import logger from 'electron-log';
import expectedFiles from '../constants/expectedfiles.json';
import slash from 'slash';

const ICON_TYPES = {
    ACTIONS: 'actions',
    PORTRAITS: 'charportraits',
    FAVORS: 'favors',
    ADD_ONS: 'itemaddons',
    ITEMS: 'items',
    STATUS: 'statuseffects',
    PERKS: 'perks',
    POWERS: 'powers',
    BANNERS: 'banners',
    RITUALS: 'dailyrituals',
    EMBLEMS: 'emblems',
    EVENTS: 'events',
    HELP: 'help',
    HELP_LOADING: 'helploading',
    STORE_BG: 'storebackgrounds',
    STORE_TABS: 'storetabs',
    ARCHIVE: 'archive'
};

export default class PerkPackArchive {

	constructor(files, basePath) {
		this.files = files;
		this.basePath = basePath;
	}

	async getFile(fileName) {
		const rawFile = this.files.find((file) => {
			return path.basename(file.newPath.toLowerCase()).endsWith(path.basename(fileName.toLowerCase()));
		});

		if (!rawFile) {
			throw Error(`Could not find file ${fileName}`);
		}

		return fs.promises.readFile(rawFile.originalPath);
	}

	async getTopLevelDirs() {
		const dirs = new Set();
		this.getAllIconFileNames().forEach((file) => {
			const dir = file.newPath.split('/')[0].toLowerCase();
			if(!dirs.has(dir)) {
				logger.info(`Adding dir ${dir} to file ${JSON.stringify(file)}`);
				dirs.add(dir);
			}
		});
		return dirs;
	}
	async getRandomIcons(type, count) {
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
			randomFiles.map((file) => currentArchive.getFile(file)),
		);
	}

	async getFavor(name) {
		return this.getFile(`iconFavors_${name}.png`);
	}

	async getItemAddon(name) {
		return this.getFile(`iconAddon_${name}.png`);
	}

	async getItem(itemName) {
		return this.getFile(`iconItems_${itemName}.png`);
	}

	async getStatusEffect(effectName) {
		return this.getFile(
			`iconStatusEffects_${effectName}.png`,
		);
	}

	async getPerk(perkName) {
		return this.getFile(`iconPerks_${perkName}.png`);
	}

	async getPower(power) {
		return this.getFile(`iconPowers_${power}.png`);
	}

	async getPortrait(character) {
		return this.getFile(
			`${character}_charSelect_portrait.png`,
		);
	}

	getAllIconFileNames(
		filterFn = () => {
			return true;
		},
	) {
		const currentArchive = this;
		return this.files
			.filter((file) => {
				const pathOnly = slash(file.newPath).toLowerCase();
				return filterFn(pathOnly);
			})
	}

	getIconList(type) {
		return this.getAllIconFileNames((file) =>
			file.startsWith(`${type}` + '/'),
		).map(file => file.originalPath);
	}

	async getAvailableTypes() {
		const dirs = await this.getTopLevelDirs();
		return [...dirs].filter((dir) =>
			Object.values(ICON_TYPES).includes(dir),
		);
	}

	async getHas() {
		const dirs = await this.getTopLevelDirs();

		const has = {
			hasActions: dirs.has('actions'),
			hasPortraits: dirs.has('charportraits'),
			hasFavors: dirs.has('favors'),
			hasItemAddOns: dirs.has('itemaddons'),
			hasItems: dirs.has('items'),
			hasStatusEffects: dirs.has('statuseffects'),
			hasPerks: dirs.has('perks'),
			hasPowers: dirs.has('powers'),
			hasArchive: dirs.has('archive'),
			hasBanners: dirs.has('banners'),
			hasRituals: dirs.has('dailyrituals'),
			hasEmblems: dirs.has('emblems'),
			hasEvents: dirs.has('events'),
			hasHelp: dirs.has('help'),
			hasHelpLoading: dirs.has('helploading'),
			hasStoreBackgrounds: dirs.has('storebackgrounds'),
			hasStoreTabs: dirs.has('storetabs')
		};

		return has;
	}
}
