import { peopleSVG } from '../icons/people';
import { cdSVG } from '../icons/cd';

const defaultAlbum = `data:image/svg+xml;base64,${btoa(cdSVG)}`;
const defaultArtist = `data:image/svg+xml;base64,${btoa(peopleSVG)}`;
const defaultPixel = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC`;
export { defaultAlbum, defaultArtist, defaultPixel };
