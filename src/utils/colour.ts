// @ts-ignore
import { tinycolor } from '@thebespokepixel/es-tinycolor';
import { FastAverageColor } from 'fast-average-color';
import { getSettingByName } from './settings';

export const ACCENT_COLOR = 'accent-color';
export const LIGHT = '#e9ecef';
export const DARK = '#3c3c3c';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

type ColorCallback = (color: RGBColor) => void;

const convertToStrict = (color: any): RGBColor => ({
  r: Math.floor(color.r),
  g: Math.floor(color.g),
  b: Math.floor(color.b),
  a: 1,
});

const getReadableColor = (rgba: RGBColor, bgcolor = LIGHT): RGBColor => {
  let readableColor = tinycolor(rgba, {});
  const backgroundColor = tinycolor(bgcolor, {});
  const adjust = bgcolor === DARK ? 'lighten' : 'darken';

  for (let attempt = 0; attempt < 100; attempt++) {
    if (
      tinycolor.isReadable(readableColor, backgroundColor, {
        level: 'AA',
        size: 'small',
      })
    ) {
      return convertToStrict(readableColor.toRgb());
    }
    readableColor = readableColor[adjust](2);
  }

  return convertToStrict(readableColor.toRgb());
};

export function getDominantColor(
  img: HTMLImageElement,
  cb: ColorCallback,
): void {
  getDominantColorByURL(img.src, cb);
}
export function getDominantColorByURL(url: string, cb: ColorCallback): void {
  const clone = new Image();
  clone.crossOrigin = 'Anonymous';
  clone.addEventListener(
    'load',
    () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = clone.width;
      canvas.height = clone.height;
      if (!context) return;

      context.drawImage(clone, 0, 0);

      const fac = new FastAverageColor();
      const rgb = fac.getColor(canvas).value;
      cb({
        r: Math.floor(rgb[0]),
        g: Math.floor(rgb[1]),
        b: Math.floor(rgb[2]),
        a: 1,
      });
    },
    false,
  );
  clone.src = url;
}
export function getColorsFromRGBWithBGColor(
  rgba: RGBColor,
  bgColor: string,
): { rgba: RGBColor; text: RGBColor } {
  const text = getReadableColor(rgba, bgColor);
  return {
    rgba,
    text,
  };
}
export function convertRGBtoString(rgba: RGBColor): string {
  return tinycolor(rgba, {}).toRgbString();
}
export function addCustomCss(colors: { text: RGBColor; rgba: RGBColor }): void {
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
  document.querySelector('#custom-css-node')?.remove();
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
      console.info('unkown theme', theme);
  }
};
