import { PerkPackArchive } from '../models/PerkPackArchive'
import PackGallery from '../utils/PackGallery';
import logger from 'electron-log';
import PackDir, { CorrectedFile } from '../packdir/PackDir';

export const DEFAULT_PERK_ICONS = ['smallgame', 'soulguard', 'trailoftorment', 'coupdegrace'];
export const DEFAULT_PORTRAIT_ICONS = ['s23', 'mk', 'gs', 'be'];

export class PreviewGenerator {
    private pack: any;
    constructor(private archive: any, files: Array<CorrectedFile>, private packDir: PackDir, private onUpdate: (line: string) => void) {
        this.pack = new PerkPackArchive(files);
    }

    async addImageToArchive(imageData: any, imageName: string) {
        if (!this.archive) {
            return;
        }
        this.archive?.append(imageData, { name: imageName });
    }

    async doPreviewCategory(desiredIcons: string[], getter: Function, category: string, pathPrefix?: string) {
        let icons = [];
        logger.info(`Processing preview for ${category}`);
        try {
            icons = await Promise.all(desiredIcons.map(icon => getter(icon)));
        } catch (e) {
            logger.info(`Error getting icons: ${e}`);
            try {
                icons = await this.pack.getRandomIcons(category, desiredIcons.length);
            } catch (randomE) {
                logger.info(`Error getting random icons: ${e}`);
                throw randomE;
            }
        }

        await Promise.all(icons.map((icon: any, i: number) => {
            return this.addImageToArchive(icon, `previews/${pathPrefix || category}_${i}.png`);
        }));
    }

    async doPerks() {
        return this.doPreviewCategory(DEFAULT_PERK_ICONS, this.pack.getPerk.bind(this.pack), 'perks');
    }

    async doPortraits() {
        return this.doPreviewCategory(DEFAULT_PORTRAIT_ICONS, this.pack.getPortrait.bind(this.pack), 'charportraits', 'portraits');
    }

    async doItems() {
        return this.doPreviewCategory(['toolboxWornOut', 'toolbox', 'flashlightSport', 'flashlightUtility', 'rainbowmap'], this.pack.getItem.bind(this.pack), 'items');
    }

    async doPowers() {
        return this.doPreviewCategory(['breath', 'UK', 'vilePurge', 'stalker3'], this.pack.getPower.bind(this.pack), 'powers');
    }

    async doAddons() {
        return this.doPreviewCategory(['coilsKit4', 'battery', 'bloodKraFabai', 'oddBulb'], this.pack.getItemAddon.bind(this.pack), 'itemaddons', 'addons');
    }

    async doStatusEffects() {
        return this.doPreviewCategory(['speed', 'cleansing', 'skillCheckDifficulty', 'healing'], this.pack.getStatusEffect.bind(this.pack), 'statuseffects', 'statusEffects');
    }

    async doFavors() {
        return this.doPreviewCategory(['primroseBlossomSachet', 'survivorPudding', 'bloodypartystreamers', 'wardBlack', 'momentoMoriEbony'], this.pack.getFavor.bind(this.pack), 'favors', 'favors');
    }

    async generate() {
        if (await this.packDir.hasPerks() === true) {
            await this.doPerks();
        }
        if (await this.packDir.hasPortraits() === true) {
            await this.doPortraits();
        }
        if (await this.packDir.hasItems() === true) {
            await this.doItems();
        }
        if (await this.packDir.hasPowers() === true) {
            await this.doPowers();
        }
        if (await this.packDir.hasAddons() === true) {
            await this.doAddons();
        }
        if (await this.packDir.hasStatusEffects() === true) {
            await this.doStatusEffects();
        }
        if (await this.packDir.hasFavors() === true) {
            await this.doFavors();
        }
        // const gallery = new PackGallery(this.pack, this.onUpdate);
        // const images = await gallery.create();
        // await Promise.all(images.map(image => {
        //     return this.addImageToArchive(image.data, `previews/gallery_${image.type}.png`);
        // }));
    }
}