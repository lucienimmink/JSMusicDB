declare const window: any;

import { tinycolor } from '@thebespokepixel/es-tinycolor';
import { FastAverageColor } from 'fast-average-color';
import { getSettingByName } from './settings';

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

export function getDominantColor(img: any, cb: any): any {
  getDominantColorByURL(img.src, cb);
}
export function getDominantColorByURL(url: any, cb: any): any {
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
        }),
      );
    },
    false,
  );
  clone.src = `${url}#no-sw-cache`;
}
export function getColorsFromRGBWithBGColor(rgba: any, bgColor: string): any {
  const text = getReadableColor(rgba, bgColor);
  return {
    rgba,
    text,
  };
}
export function convertRGBtoString(rgba: any): string {
  return tinycolor(rgba, {}).toRgbString();
}
export async function addCustomCss(colors: any) {
  const accentCSSOverrideNode: HTMLElement = document.createElement('style');
  const { text, rgba } = colors;
  accentCSSOverrideNode.setAttribute('type', 'text/css');
  accentCSSOverrideNode.id = 'custom-css-node';
  accentCSSOverrideNode.textContent = `
      @charset "UTF-8";
      :root {
        --primary: rgb(${text.r} ${text.g} ${text.b});
      }`;
  removeCustomCss();
  document.querySelector('body')?.appendChild(accentCSSOverrideNode);
  document
    .querySelector('[name="theme-color"]')
    ?.setAttribute('content', tinycolor(rgba, {}).toRgbString());
}
export function removeCustomCss(): void {
  if (document.querySelector('#custom-css-node')) {
    document.querySelector('#custom-css-node')?.remove();
  }
}

export const currentBgColor = async () => {
  const theme = await getSettingByName('theme');
  switch (theme) {
    case 'light':
      return LIGHT;
    case 'dark':
      return DARK;
    case 'system':
      // eslint-disable-next-line no-case-declarations
      const darkMode = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      return darkMode ? DARK : LIGHT;
    default:
      console.log('unkown theme', theme);
  }
};
