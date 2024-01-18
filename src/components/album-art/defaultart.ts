import { cdSVG } from '../icons/cd';
import { peopleSVG } from '../icons/people';
import { cdSVG as cdDarkSVG } from '../icons/cd-dark';
import { peopleSVG as peopleDarkSVG } from '../icons/people-dark';

const defaultAlbumLight = `data:image/svg+xml;base64,${btoa(cdSVG)}`;
const defaultArtistLight = `data:image/svg+xml;base64,${btoa(peopleSVG)}`;
const defaultAlbumDark = `data:image/svg+xml;base64,${btoa(cdDarkSVG)}`;
const defaultArtistDark = `data:image/svg+xml;base64,${btoa(peopleDarkSVG)}`;
const defaultPixel = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC`;
export {
  defaultAlbumLight,
  defaultArtistLight,
  defaultPixel,
  defaultAlbumDark,
  defaultArtistDark,
};
