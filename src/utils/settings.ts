import { set, get } from 'idb-keyval';

const LAST_PARSED = "last-parsed"
const SETTINGS = "settings"
const SCROBBLE_CACHE = "scrobble-cache"

export const TOGGLE_SETTING = 'toggle-setting'

export const getLastParsed = () => {
  return get(LAST_PARSED)
}
export const setLastParsed = (timestamp: Date) => {
  return set(LAST_PARSED, timestamp)
}
export const getSettings = () => {
  return get(SETTINGS)
}
export const setSetting = (prop: string, value: any) => {
  return getSettings().then((settings: any) => {
    if (!settings) {
      settings = {};
    }
    settings[prop] = value;
    return set(SETTINGS, settings);
  })
}

export const getSettingByName = async (prop: string) => {
  const settings:any = await getSettings();
  if (!settings) return null;
  return settings[prop] || null;
}
export const getScrobbleCache = () => {
  return get(SCROBBLE_CACHE)
}
export const setScrobbleCache = (cachedTracks: Array<any>) => {
  return set(SCROBBLE_CACHE, cachedTracks)
}
