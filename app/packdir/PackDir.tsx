import path from 'path';
import slash from 'slash';
import recursiveRead from 'recursive-readdir';
import { default as fsWithCallbacks } from 'fs';
const fs = fsWithCallbacks.promises;

type ExpectedFile = {
  normalized: string;
  actual: string;
};

export type CorrectedFile = {
  originalPath: string; // Absolute path on filesystem
  newPath: string; // This is the relative path inside the zip
};
export default class PackDir {
  private normalizedFiles: Array<string> = []; // Local paths relative to pack directory, lowercase and unixified
  private correctedPathFiles: Array<CorrectedFile> = [];
  private excludedFiles: Array<string> = [
    'iconperks_artefacthunter.png',
    'iconperks_laststanding.png',
    'iconperks_toughrunner.png',
    'iconperks_underperform.png',
    'missing.png',
    'toth_temp.png',
    'iconperks_temp1.png',
    'iconperks_temp2.png',
    'xhair.png',
    'iconfavors_temp1.png',
    'iconfavors_temp2.png',
    'iconitems_trapple.png',
    'iconitems_temp1.png',
    'missing.png',
    'iconitemaddon_temp1.png',
    'iconaddon_gum.png',
    'iconaddon_inhaler.png',
    'iconpowers_temp1.png',
    'iconpowers_axe.png',
    'iconpowers_stalker3a.png',
    'iconpowers_detention.png',
  ]

  constructor(public dir: string, private onUpdate: (line: string) => void, private expectedFiles: any) {
  
  }

  async populateNormalizedFiles() {
    if (this.normalizedFiles.length === 0) {
      const userFilesRaw = await recursiveRead(this.dir);
      this.normalizedFiles = userFilesRaw.map((file: string) => {
        return slash(path.relative(this.dir, file)).toLowerCase();
      });
      this.normalizedFiles.sort();
    }
  }

  getExpectedFileByFilename(fileName: string): ExpectedFile | undefined {
    return this.expectedFiles.find((file: { normalized: string, actual: string }) => {
      return path.basename(file.normalized) === path.basename(fileName);
    });
  }

  getExpectedFileByFilePath(fileName: string): ExpectedFile | undefined {
    return this.expectedFiles.find((file: { normalized: string, actual: string }) => {
      return slash(fileName).toLowerCase().includes(slash(file.normalized).toLowerCase()) ||
        slash(file.normalized).toLowerCase().includes(slash(fileName).toLowerCase());
    });
  }

  getNormalizedFilePath(fileName: string): string | undefined {
    let foundPath = this.getExpectedFileByFilePath(fileName) ?? this.getExpectedFileByFilename(fileName);
    if (!foundPath) {
      this.onUpdate(`Unexpected File Excluded: ${fileName}`);
    }

    if (foundPath && this.excludedFiles.includes(path.basename(foundPath.normalized))) {
      foundPath = undefined;
      this.onUpdate(`Unexpected File Excluded: ${fileName}`);
    }

    return foundPath?.actual;
  }

  async correctFilePaths() {
    if (this.correctedPathFiles.length === 0) {
      const normalizedFiles = await this.getNormalizedFiles();
      normalizedFiles.forEach((file: string) => {
        const fullPath = this.getNormalizedFilePath(file);

        if (fullPath) {
          const currentEntryIndex = this.correctedPathFiles.findIndex(correctedPath => correctedPath.newPath === fullPath);
          if (currentEntryIndex < 0) {
            this.correctedPathFiles.push({
              originalPath: path.resolve(this.dir, file),
              newPath: fullPath
            });
          } else {
            // The pack is already in the list
            // Decide whether or not the current file is a better match

            const relativePathSegments = slash(fullPath).toLowerCase().split('/');
            const fsPathSegments = file.split('/');

            // If this entry doesn't have any segments that don't exist in the relative path
            let replace = true;
            for (let i = 0; i < fsPathSegments.length; i++) {
              if (!relativePathSegments.includes(fsPathSegments[i])) {
                replace = false;
                break;
              }
            }

            if (replace) {
              this.onUpdate(`File ${path.resolve(this.dir, file)} is a closer match than ${this.correctedPathFiles[currentEntryIndex].originalPath}, replacing`);
              this.correctedPathFiles[currentEntryIndex].originalPath = path.resolve(this.dir, file);
            }
          }
        }
      });
    }
  }

  async getCorrectedFilePaths(): Promise<Array<CorrectedFile>> {
    await this.correctFilePaths();
    return this.correctedPathFiles;
  }

  async getNormalizedFiles(): Promise<Array<string>> {
    await this.populateNormalizedFiles();
    return this.normalizedFiles;
  }

  async dirExists(dir: string) {
    try {
      const stats = await fs.lstat(dir);
      return stats.isDirectory();
    } catch (e) {
      return false;
    }
  }

  async hasPerks() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconperks_');
    });
  }

  async hasPortraits() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).includes('charselect_portrait');
    });
  }

  async validate(): Promise<{
    isValid: false;
    failReason: string;
  } | {
    isValid: true;
    skipFiles: Array<string>;
  }> {
    const perksDirExists = await this.hasPerks();
    const portraitsDirExists = await this.hasPortraits();
    if (perksDirExists || portraitsDirExists) {
      // TODO -- not sure if this is actually needed since the pack meta stuff has moved to server side
      await this.correctFilePaths();
    }

    if (!perksDirExists && !portraitsDirExists) {
      return {
        isValid: false,
        failReason:
          'Must have either Perks directory or CharPortraits directory'
      };
    }

    return {
      isValid: true,
      skipFiles: []
    };
  }

  async hasItems() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconitems_');
    });
  }

  async hasPowers() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconpowers');
    });
  }

  async hasAddons() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconaddon_');
    });
  }

  async hasStatusEffects() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconstatuseffects_');
    });
  }

  async hasFavors() {
    const normalizedFiles = await this.getNormalizedFiles();
    return normalizedFiles.some(file => {
      return path.basename(file).startsWith('iconfavors_');
    });
  }
}
