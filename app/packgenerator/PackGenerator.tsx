import path from 'path';
import PackDir, { CorrectedFile } from '../packdir/PackDir';
import archiver from 'archiver';
import slugify from '@sindresorhus/slugify';
import slash from 'slash';
import fs from 'fs';
import log from 'electron-log';
import { DEFAULT_PERK_ICONS, DEFAULT_PORTRAIT_ICONS, PreviewGenerator } from './PreviewGenerator';
import {IconType, PerkPackArchive} from '../models/PerkPackArchive';

export default class PackGenerator {
  packZipFile: string;
  outputZip: string;
  constructor(
    private packDir: PackDir,
    private outputPath: string = '',
    private packName: string,
    private parentPack: string | undefined,
    private packAuthor: string,
    private packDescription: string,
    private skipFiles: Array<string>,
  ) {
    this.packDir = packDir;
    if (outputPath.length === 0) {
      this.outputPath = path.resolve(packDir.dir, '..');
    } else {
      this.outputPath = outputPath;
    }

    this.packZipFile = slugify(packName) + '.zip';
    this.outputZip = path.resolve(this.outputPath, this.packZipFile);
    this.packName = packName;
    this.packAuthor = packAuthor;
    this.packDescription = packDescription;
    this.skipFiles = skipFiles;
  }

  async getPreviewImages() {
    const packMeta = {
      name: this.packName,
      author: this.packAuthor,
      description: this.packDescription,
      isNsfw: false,
      parentPack: this.parentPack,
      ...(await this.packDir.getMeta())
    }

    const files = await this.packDir.getCorrectedFilePaths();

    const packArchive = new PerkPackArchive(files);

    const defaults = packMeta.hasPerks ? DEFAULT_PERK_ICONS : DEFAULT_PORTRAIT_ICONS;
    const getter = packMeta.hasPerks ? packArchive.getPerk.bind(packArchive) : packArchive.getPortrait.bind(packArchive);

    let images = [];
    try {
      images = await Promise.all(defaults.map(name => {
        return getter(name);
      }));
    } catch (e) {
      images = await packArchive.getRandomIcons(packMeta.hasPerks ? IconType.PERKS : IconType.PORTRAITS, 4);
    }


    return images.map(image => `data:image/png;base64, ${image.toString('base64')}`)
  }

  async generate(previews: string[], hasPreviewBanner: boolean, onUpdate: (line: string) => void) {
    const currentGen = this;
    return new Promise(async (resolve, reject) => {
      // Start building archive
      onUpdate('Building archive ' + path.resolve(this.outputPath, this.packZipFile));
      const output = fs.createWriteStream(
        path.resolve(this.outputPath, this.packZipFile)
      );

      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      output.on('close', function () {
        onUpdate(archive.pointer() + ' total bytes')
        onUpdate(
          'archiver has been finalized and the output file descriptor has closed.'
        );
        resolve(currentGen.outputZip);
      });

      // good practice to catch this error explicitly
      archive.on('error', function (err) {
        reject(err);
      });

      archive.pipe(output);

      onUpdate('Making dir...');

      const packMeta = {
        name: this.packName,
        author: this.packAuthor,
        description: this.packDescription,
        isNsfw: false,
        parentPack: this.parentPack,
        hasCustomPreviews: true,
        hasPreviewBanner,
        ...(await this.packDir.getMeta())
      }

      onUpdate('Pack Meta: ' + JSON.stringify(packMeta));

      const files = await this.packDir.getCorrectedFilePaths();

      files.forEach((file: CorrectedFile) => {
        const pathInZip = slash(file.newPath);
        if (currentGen.skipFiles.includes(pathInZip.toLowerCase())) {
          // log.warn(`Skipping ${pathInZip}`);
        } else {
          archive.append(fs.createReadStream(file.originalPath), { name: 'Pack/' + pathInZip });
        }
      });

      try {
        onUpdate('Building preview images');
        const previewGenerator = new PreviewGenerator(archive, files, packMeta, onUpdate);
        await previewGenerator.generate();
      } catch (e) {
        reject(e);
        return;
      }

      previews.forEach((preview, index) => {
        const buf = this.base64ImageToBuffer(preview);
        archive.append(buf, {
          name: 'previews/preview_' + index + '.png'
        })
      })

      archive.append(JSON.stringify(packMeta, null, 2), {
        name: 'meta.json'
      });

      log.info('Finalizing');
      archive.finalize();
    });
  }

  private base64ImageToBuffer(image: string) {
    const data = image.split('data:image/png;base64, ')[1];
    return Buffer.from(data, 'base64');
  }
}
