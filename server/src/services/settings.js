import { Settings } from '../models/misc.js';

export const getSettings = () =>
  Settings.findOneAndUpdate({ key: 'store' }, { $setOnInsert: { key: 'store' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
