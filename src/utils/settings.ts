import { get, set } from 'idb-keyval';

const LAST_PARSED = 'last-parsed';
const SETTINGS = 'settings';
const SCROBBLE_CACHE = 'scrobble-cache';

export const TOGGLE_SETTING = 'toggle-setting';

export const getLastParsed = () => get(LAST_PARSED);
export const setLastParsed = (timestamp: Date) => set(LAST_PARSED, timestamp);
export const getSettings = () => get(SETTINGS);
export const setSetting = (prop: string, value: any) =>
  getSettings().then((settings: any) => {
    if (!settings) {
      settings = {};
    }
    settings[prop] = value;
    return set(SETTINGS, settings);
  });

export const getSettingByName = async (prop: string) => {
  const settings: any = await getSettings();
  if (!settings) return null;
  return settings[prop] || null;
};
export const getScrobbleCache = () => get(SCROBBLE_CACHE);
export const setScrobbleCache = (cachedTracks: Array<any>) =>
  set(SCROBBLE_CACHE, cachedTracks);
