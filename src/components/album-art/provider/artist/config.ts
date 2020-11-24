import { fetchArt as fanart } from "./fanart";
import { fetchArt as audiodb } from "./audiodb";

const config = [
  {
    provider: fanart,
    key: "mbid"
  },
  {
    provider: audiodb,
    key: "artist"
  }
];

export { config };
