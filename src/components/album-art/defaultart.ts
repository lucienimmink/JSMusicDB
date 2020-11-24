import { peopleIcon } from '../icons/people';
import { cdIcon } from '../icons/cd';

const defaultAlbum = `data:image/svg+xml;base64,${btoa(cdIcon.getHTML())}`;
const defaultArtist = `data:image/svg+xml;base64,${btoa(peopleIcon.getHTML())}`;
const defaultPixel = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC`;
export { defaultAlbum, defaultArtist, defaultPixel };
