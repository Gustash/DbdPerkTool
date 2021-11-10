import { PackMeta } from "../api/ApiTypes";

export default class PackMetaMapper {
  static fromRaw(rawPackMeta: any): PackMeta {
    return {
      latestChapter: rawPackMeta.latestChapter,
      hasPortraits: rawPackMeta.hasPortraits,
      hasPowers: rawPackMeta.hasPowers,
      hasAddons: rawPackMeta.hasAddons,
      hasFavors: rawPackMeta.hasFavors,
      hasItems: rawPackMeta.hasItems,
      hasStatusEffects: rawPackMeta.hasStatusEffects,
      hasPerks: rawPackMeta.hasPerks,
      description: rawPackMeta.description,
      downloads: rawPackMeta.downloads,
      lastUpdate: new Date(rawPackMeta.lastUpdate),
      id: rawPackMeta.id,
      author: rawPackMeta.author,
      name: rawPackMeta.name
    };
  }
}
