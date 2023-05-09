import { css } from 'lit';

export default css`
  img {
    width: 100%;
    height: 100%;
    transition: opacity 0.2s ease-in-out;
    background: var(--background-album-art);
  }
  ::-moz-selection {
    background-color: var(--primary);
  }
  ::selection {
    background-color: var(--primary);
  }
  p {
    margin: 0;
  }
  .loading {
    opacity: 0.25;
    filter: blur(5px);
  }
  .transparent {
    background: transparent;
  }
  .default {
    filter: var(--album-art-filter);
  }
`;
