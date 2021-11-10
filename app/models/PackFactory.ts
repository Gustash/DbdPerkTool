import PortraitPack from './PortraitPack';
import PerkPack from './PerkPack';
import {IconPack} from './IconPack';
import { PackMeta } from '../api/ApiTypes';

export default class PackFactory {
	static fromData(meta: PackMeta): IconPack {
		if(!meta.hasPerks) {
			return new PortraitPack(meta);
		} else {
			return new PerkPack(meta);
		}
	}
}