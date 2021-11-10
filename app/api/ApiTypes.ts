import { Ability } from "@casl/ability";

export type User = {
    username: string;
    role: string;
    steamId: string;
    abilities: Ability;
    hasAcceptedUploadAgreement: boolean
    author?: {
        name: string;
    }
  }

  export type PackQueryParams = {
    page?: number;
    limit?: number;
    capabilities?: string;
    unapproved?: boolean;
    search?: string;
    isFeatured?: boolean;
    favorites?: boolean;
    mine?: boolean;
    sort?: string;
    sortdir?: string;
    defaultOnly?: boolean;
  }

  export type PackCapabilities = {
	hasPortraits: boolean;
	hasPowers: boolean;
	hasItems: boolean;
	hasStatusEffects: boolean;
	hasPerks: boolean;
	hasAddons: boolean;
	hasFavors: boolean;
}

export type PackMeta = {
	latestChapter: string;
	description: string;
	downloads: number;
	lastUpdate: Date;
	id: string;
	author: string;
	name: string;
} & PackCapabilities;