import { Ability } from "@casl/ability";

export type User = {
  username: string;
  role: string;
  steamId: string;
  abilities: Ability;
  hasAcceptedUploadAgreement: boolean
  numNotifications?: number;
  author?: {
    name: string;
  }
  getNotifications: (page?: number, limit?: number) => Promise<ApiNotifications>;
  markAllNotificationsRead: () => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  deleteNotification: (notification: ApiNotification) => Promise<void>;
  markNotification: (notification: ApiNotification, read: boolean) => Promise<void>;
  getNumNotifications: () => Promise<number>;
}

export type ApiNotifications = ApiList<ApiNotification>;

export type ApiNotification = {
  _id: string;
  name: string;
  text: string;
  read: boolean;
}

export type ApiList<T> = {
  meta: {
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  data: T[]
}

export type PackQueryParams = {
  page?: number;
  limit?: number;
  light?: boolean;
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

export type ExpectedFile = {
  actual: string;
  normalized: string;
}

export type LightPack = Pick<PackMeta, 'id' | 'author' | 'name' | 'description'>;

export type PackMeta = {
  latestChapter: string;
  description: string;
  downloads: number;
  lastUpdate: Date;
  id: string;
  author: string;
  name: string;
  dryRun?: boolean;
  hasCustomPreviews?: boolean;
  hasPreviewBanner?: boolean;
} & PackCapabilities;

export type UploadPackMeta = Pick<PackMeta, 'name' | 'description' | 'dryRun' | 'author' | 'hasCustomPreviews' | 'hasPreviewBanner'>;
