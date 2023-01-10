declare const window: any;

import { tinycolor } from '@thebespokepixel/es-tinycolor';
import { FastAverageColor } from 'fast-average-color';
import { fetchWithTimeout } from './fetch';
import { getSettingByName, setSetting } from './settings';

export const ACCENT_COLOR = 'accent-color';
export const LIGHT = '#e9ecef';
export const DARK = '#3c3c3c';

const convertToStrict = (color: any): any => {
  color.r = Math.floor(color.r);
  color.g = Math.floor(color.g);
  color.b = Math.floor(color.b);
  color.a = 1;
  // don't round down the alpha channel, silly :)
  return color;
};

const getReadableColor = (rgba: any, bgcolor = LIGHT): any => {
  if (
    !tinycolor.isReadable(rgba, tinycolor(bgcolor, {}), {
      level: 'AA',
      size: 'small',
    })
  ) {
    if (bgcolor === DARK) {
      return getReadableColor(tinycolor(rgba, {}).lighten(2), bgcolor);
    }
    return getReadableColor(tinycolor(rgba, {}).darken(2), bgcolor);
  }
  return convertToStrict(tinycolor(rgba, {}).toRgb());
};

const getHighestContrast = (color: any): any => {
  return tinycolor.readability(tinycolor(DARK, {}), color) >
    tinycolor.readability(tinycolor(LIGHT, {}), color)
    ? DARK
    : LIGHT;
};
export function getDominantColor(img: any, cb: any, override: any): any {
  // getDominantColorByURL(img.src, cb, override);
  const loaded = () => {
    img.removeEventListener('load', loaded);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context?.drawImage(img, 0, 0);

    const fac = new FastAverageColor();
    const rgb = fac.getColor(canvas).value;
    cb(
      convertToStrict({
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
      })
    );
  };
  img?.addEventListener('load', loaded);
}
export function getDominantColorByURL(
  url: any,
  cb: any,
  override = false
): any {
  if (window.runningInElectron && !override) {
    // send an event to download this image
    document.querySelector('lit-musicdb')?.dispatchEvent(
      new CustomEvent('external.mdbuntaint', {
        detail: { url },
      })
    );
  } else {
    // clone the img object
    const clone = new Image();
    clone.crossOrigin = 'Anonymous';
    clone.addEventListener(
      'load',
      () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = clone.width;
        canvas.height = clone.height;
        context?.drawImage(clone, 0, 0);

        const fac = new FastAverageColor();
        const rgb = fac.getColor(canvas).value;
        cb(
          convertToStrict({
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],
          })
        );
      },
      false
    );
    clone.src = url;
  }
}
export function getColorsFromRGBWithBGColor(rgba: any, bgColor: string): any {
  const text = getReadableColor(rgba, bgColor);
  const lighten = convertToStrict(tinycolor(text, {}).lighten().toRgb());
  const darken = convertToStrict(tinycolor(text, {}).darken().toRgb());
  const lighten30 = convertToStrict(tinycolor(text, {}).lighten(30).toRgb());
  const darken30 = convertToStrict(tinycolor(text, {}).darken(30).toRgb());
  return {
    rgba,
    text,
    lighten,
    darken,
    lighten30,
    darken30,
    letterColor: getHighestContrast(tinycolor(text, {})),
  };
}
export function convertRGBtoString(rgba: any): string {
  return tinycolor(rgba, {}).toRgbString();
}
export function addCustomCss(colors: any): void {
  const accentCSSOverrideNode: HTMLElement = document.createElement('style');
  const { darken, lighten, text, letterColor, darken30, lighten30 } = colors;
  accentCSSOverrideNode.setAttribute('type', 'text/css');
  accentCSSOverrideNode.id = 'custom-css-node';
  accentCSSOverrideNode.textContent = `
      @charset "UTF-8";
      :root {
        --primary: rgba(${text.r}, ${text.g}, ${text.b}, 1);
        --darken: rgba(${darken.r}, ${darken.g}, ${darken.b}, 1);
        --lighten: rgba(${lighten.r}, ${lighten.g}, ${lighten.b}, 1);
        --darken30: rgba(${darken30.r}, ${darken30.g}, ${darken30.b}, 1);
        --lighten30: rgba(${lighten30.r}, ${lighten30.g}, ${lighten30.b}, 1);
        --letter-color: ${letterColor};
      }`;
  removeCustomCss();
  document.querySelector('body')?.appendChild(accentCSSOverrideNode);
  document
    .querySelector('[name="theme-color"]')
    ?.setAttribute('content', `rgb(${darken.r}, ${darken.g}, ${darken.b})`);
}
export function removeCustomCss(): void {
  if (document.querySelector('#custom-css-node')) {
    document.querySelector('#custom-css-node')?.remove();
  }
}
const _getCurrentColour = async () => {
  const now: any = new Date();
  let stop: any = await getSettingByName('stop');
  let start: any = await getSettingByName('start');
  if (!start) {
    start = (await _getNewStartAndStop()).start;
  }
  if (!stop) {
    stop = (await _getNewStartAndStop()).stop;
  }
  if (now > start && now < stop) {
    return DARK;
  }
  return LIGHT;
};
const _getNewStartAndStop = async () => {
  const now: Date = new Date();
  const stop: Date = new Date();
  const start: Date = new Date();

  start.setSeconds(0);
  start.setMinutes(0);
  start.setHours(21);

  if (now > start) {
    stop.setDate(stop.getDate() + 1);
  }
  stop.setSeconds(0);
  stop.setMinutes(0);
  stop.setHours(9);
  return { start, stop };
};
const _setSunrise = async (start: any, stop: any) => {
  await setSetting('start', start);
  await setSetting('stop', stop);
};
export const getCurrentTheme = async () => {
  const now: any = new Date();
  let stop: any = await getSettingByName('stop');
  let start: any = await getSettingByName('start');
  if (!start) {
    start = (await _getNewStartAndStop()).start;
  }
  if (!stop) {
    stop = (await _getNewStartAndStop()).stop;
  }
  const theme = {
    theme: 'light',
    nextCycle: 0,
  };
  if (now > start && now < stop) {
    theme.nextCycle = stop - now;
    theme.theme = 'dark';
  }
  if (now < start) {
    theme.nextCycle = start - now;
  }
  return theme;
};
export const updateSunriseData = async (useGPS = true) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve: any) => {
    if (useGPS) {
      return navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const response = await fetchWithTimeout(
          `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`,
          { timeout: 10000 }
        );
        const { results } = await response.json();
        const sunset = new Date(results.sunset);
        const sunrise: Date = new Date(results.sunrise);
        const nextDayStop: Date = new Date(
          sunrise.setDate(sunrise.getDate() + 1)
        );
        return resolve(await _setSunrise(sunset, nextDayStop));
      });
    }
    const { start, stop }: { start: Date; stop: Date } =
      await _getNewStartAndStop();
    return resolve(await _setSunrise(start, stop));
  });
};
export const currentBgColor = async () => {
  const theme = await getSettingByName('theme');
  const currentIfAuto: any = await _getCurrentColour();
  switch (theme) {
    case 'light':
      return LIGHT;
    case 'dark':
      return DARK;
    case 'system':
      // eslint-disable-next-line no-case-declarations
      const darkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      return darkMode ? DARK : LIGHT;
    case 'auto':
      return currentIfAuto;
  }
};
