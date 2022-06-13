import log from 'electron-log';
// import getLanguageItemAddon from './ItemAddons';
// import getLanguagePortrait from './Portraits';
// import getLanguageActions from './Actions';
import getLanguageRoot from './Root';
// import getLanguageArchive from './Archive';
// import getLanguageAuric from './AuricCellPacks';
// import getLanguageDaily from './DailyRituals';
// import getLanguageEmblems from './Emblems';
// import getLanguageHelp from './Help';
// import getLanguageItems from './Items';
// import getLanguageOfferings from './Offerings';
// import getLanguagePerks from './Perks';
// import getLanguagePowers from './Powers';
// import getLanguageStatus from './StatusEffects';
// import getLanguageStoreTabs from './StoreTabs';
import Api from '../api/Api';

class UiLanguage {
  private languages: Record<string, string> = {};

  private getDefaultLanguage(filePath: string) {
    log.info(`Getting default language for ${filePath}`);
    return filePath;
  }

  public async initialize() {
    log.info('Initializing UI Language module');
    this.languages = await Api.getLanguageMap();
  }

  public getLanguage(filePath: string) {
    return (
      this.languages[filePath] ??
      getLanguageRoot(filePath) ??
      this.getDefaultLanguage(filePath)
    );
  }
}

const uiLanguage = new UiLanguage();

export { uiLanguage };
