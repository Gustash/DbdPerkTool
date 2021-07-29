import path from 'path';
import slash from 'slash';
import recursiveRead from 'recursive-readdir';
import log from 'electron-log';
import expectedFiles from '../constants/expectedfiles.json';
import { default as fsWithCallbacks } from 'fs';
const fs = fsWithCallbacks.promises;

type metaSchema = {
  latestChapter: string;
  hasPortraits: boolean;
  hasPowers: boolean;
  hasItems: boolean;
  hasStatusEffects: boolean;
  hasPerks: boolean;
  hasAddons: boolean;
  hasFavors: boolean;
};

export type CorrectedFile = {
  originalPath: string;
  newPath: string;
};
export default class PackDir {
  dir: string;
  meta: metaSchema;
  metaFilled: boolean;
  normalizedFiles: Array<string> = [];
  correctedPathFiles: Array<CorrectedFile> = [];

  constructor(dir: string) {
    this.dir = dir;
    this.meta = {
      latestChapter: 'Unknown',
      hasPortraits: false,
      hasPowers: false,
      hasItems: false,
      hasStatusEffects: false,
      hasPerks: false,
      hasAddons: false,
      hasFavors: false
    };
    this.metaFilled = false;
  }

  async populateNormalizedFiles() {
    if(this.normalizedFiles.length === 0) {
      const userFilesRaw = await recursiveRead(this.dir);
      this.normalizedFiles = userFilesRaw.map(file => {
        return slash(path.relative(this.dir, file)).toLowerCase();
      });
      this.normalizedFiles.sort();
    }
  }

  getNormalizedFilePath(fileName: string): string | undefined {
    const foundPath = expectedFiles.find((file: {normalized: string, actual: string}) => {
      return path.basename(file.normalized) === path.basename(fileName);
    });
    return foundPath?.actual;
  }

  async correctFilePaths() {
    if(this.correctedPathFiles.length === 0) {
      const normalizedFiles = await this.getNormalizedFiles();
      normalizedFiles.forEach((file: string) => {
          const fullPath = this.getNormalizedFilePath(file);
          if(fullPath) {
            this.correctedPathFiles.push({
              originalPath: path.resolve(this.dir, file),
              newPath: fullPath
            });
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


  async getUnexpectedFiles() {
    const actualExpectedFiles = expectedFiles.map(file => file.actual);
    const unexpectedFiles = (await this.correctedPathFiles).filter((file: CorrectedFile) => {
      return !actualExpectedFiles.includes(file.newPath);
    });

    log.info('Unexpected Files', unexpectedFiles);

    return unexpectedFiles;
  }

  async validate() {
    const perksDirExists = await this.hasPerks();
    const portraitsDirExists = await this.hasPortraits();
    if (perksDirExists || portraitsDirExists) {
      await this.correctFilePaths();
      this.meta.latestChapter = await this.getLatestChapter();
      this.meta.hasPortraits = portraitsDirExists;
      this.meta.hasPerks = perksDirExists;
      this.meta.hasPowers = await this.hasPowers();
      this.meta.hasItems = await this.hasItems();
      this.meta.hasStatusEffects = await this.hasStatusEffects();
      this.meta.hasAddons = await this.hasAddons();
      this.meta.hasFavors = await this.hasFavors();
    }

    if (!perksDirExists && !portraitsDirExists) {
      return {
        isValid: false,
        failReason:
          'Must have either Perks directory or CharPortraits directory'
      };
    }

    const unexpectedFiles = await this.getUnexpectedFiles();

    return {
      isValid: true,
      skipFiles: unexpectedFiles
    };
  }

  async getLatestChapter() {
    const correctedPaths = (await this.getCorrectedFilePaths()).map(correctedPath => correctedPath.newPath);
    

    const dirs: Array<string> = [];

    correctedPaths.forEach((file: string) => {
      const dir = file.match(/([^\/]*)\/*$/)?.[1];
      if(dir && !dirs.includes(dir)) {
        dirs.push(dir);
      }
    });

    if(dirs.includes('eclipse')) {
      return 'Chapter XX: Resident Evil';
    } else if (dirs.includes('comet')) {
      return 'Chapter XIX: All-Kill';
    } else if (dirs.includes('aurora')) {
      return 'Chapter XVIII: A Binding of Kin';
    } else if (dirs.includes('yemen')) {
      return 'Chapter XVII: Descend Beyond';
    } else if (dirs.includes('wales')) {
      return 'Chapter XVI: Silent Hill';
    } else if (dirs.includes('ukraine')) {
      return 'Chapter XV: Chains of Hate';
    } else if (dirs.includes('sweden')) {
      return 'Chapter XIV: Cursed Legacy';
    } else if (dirs.includes('qatar')) {
      return 'Chapter XIII: Stranger Things';
    } else {
      return 'Unknown';
    }
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

  async getMeta() {
    if (!this.metaFilled) {
      await this.validate();
      this.metaFilled = true;
    }
    return this.meta;
  }
}
