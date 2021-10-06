import path from 'path';
import PackDir, { CorrectedFile } from '../packdir/PackDir';
import archiver from 'archiver';
import slugify from '@sindresorhus/slugify';
import { promisify } from 'util';
import slash from 'slash';
import fs from 'fs';
import log from 'electron-log';
import { DEFAULT_PERK_ICONS, DEFAULT_PORTRAIT_ICONS, PreviewGenerator } from './PreviewGenerator';
import PerkPackArchive from '../models/PerkPackArchive';


const readdirAsync = promisify(fs.readdir);

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
    private skipFiles: Array<string>
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

    const files = this.packDir.correctedPathFiles;

    const packArchive = new PerkPackArchive(files, this.packDir.dir);

    const defaults = packMeta.hasPerks ? DEFAULT_PERK_ICONS : DEFAULT_PORTRAIT_ICONS;
    const getter = packMeta.hasPerks ? packArchive.getPerk.bind(packArchive) : packArchive.getPortrait.bind(packArchive);

    const images = await Promise.all(defaults.map(name => {
      return getter(name);
    }));

    return images.map(image => `data:image/png;base64, ${image.toString('base64')}`)
  }

  async generate(previews: string[], hasPreviewBanner) {
    const currentGen = this;
    return new Promise(async (resolve, reject) => {
      // Start building archive
      log.info(
        'Building archive ' + path.resolve(this.outputPath, this.packZipFile)
      );
      const output = fs.createWriteStream(
        path.resolve(this.outputPath, this.packZipFile)
      );

      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      output.on('close', function () {
        log.info(archive.pointer() + ' total bytes');
        log.info(
          'archiver has been finalized and the output file descriptor has closed.'
        );
        resolve(currentGen.outputZip);
      });

      // good practice to catch this error explicitly
      archive.on('error', function (err) {
        reject(err);
      });

      archive.pipe(output);

      log.info('Making dir...');

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

      log.info('Pack Meta: ' + JSON.stringify(packMeta));

      const files = this.packDir.correctedPathFiles;

      files.forEach((file: CorrectedFile) => {
        const pathInZip = slash(file.newPath);
        if (currentGen.skipFiles.includes(pathInZip.toLowerCase())) {
          // log.warn(`Skipping ${pathInZip}`);
        } else {
          archive.append(fs.createReadStream(file.originalPath), { name: 'Pack/' + pathInZip });
        }
      });

      // TODO build previews
      try {
        const previewGenerator = new PreviewGenerator(archive, files, this.packDir.dir, packMeta);
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
