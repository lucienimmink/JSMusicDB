import { css } from 'lit';

export default css`
  .wrapper {
    color: var(--text-color);
    background: var(--background);
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    overflow: hidden;
  }
  .backdrop {
    position: fixed;
  }
  dialog {
    border: 1px solid var(--background2);
    box-shadow: 0px 0px 1px var(--primary);
    padding: 0;
  }
  dialog::backdrop {
    backdrop-filter: blur(5px);
  }
  dialog album-art {
    margin-right: 0;
    margin-left: 0;
    display: block;
    max-width: 90vw;
    max-height: 90vw;
    width: auto;
    height: auto;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    cursor: pointer;
  }
  @media (orientation: landscape) {
    dialog album-art {
      max-width: 90vh;
      max-height: 90vh;
    }
  }
  @media (orientation: landscape) {
    .backdrop {
      width: 100%;
      margin-top: calc((100vh - 100vw) / 4);
    }
  }
  @media (orientation: portrait) {
    .backdrop {
      height: 100%;
      margin-left: calc((100vw - 100vh) / 4);
    }
  }
  .top {
    backdrop-filter: blur(5px);
    background: var(--background-seethrough);
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 50px);
    position: relative;
    transition: transform 0.2s ease-in-out;
  }
  .top.classic-vis {
    background: rgba(0, 0, 0, 0.85);
  }
  .bottom {
    backdrop-filter: blur(5px);
    background: var(--background-seethrough);
    z-index: 1;
    display: block;
    position: absolute;
    left: 0px;
    top: 50px;
    right: 0px;
    height: calc(100vh - 129px);
    overflow-y: auto;
    transform: translateY(100vh);
    transition: transform 0.2s ease-in-out;
  }
  .bottomShown .top {
    transform: translateY(calc(-100vh + 135px));
  }
  .bottomShown .bottom {
    transform: translateY(calc(35px));
  }
  .image-wrapper {
    flex-grow: 1;
    position: relative;
    max-height: calc(100vh - 50px - 135px);
  }
  .album-art {
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    margin: 0px auto;
    z-index: 1;
    position: absolute;
    pointer-events: none;
  }
  .previous-album-art {
    transform: translateX(-100%);
    z-index: 2;
  }
  .next-album-art {
    transform: translateX(100%);
    z-index: 2;
  }
  .smallArt .previous-album-art {
    display: none;
  }
  .smallArt .next-album-art {
    display: none;
  }
  .controls-wrapper {
    height: 135px;
    max-height: 135px;
    flex-grow: 0;
    padding: 0 10px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--background) 100%
    );
  }
  .controls-wrapper.classic-vis {
    background: var(--background);
  }
  .container {
    display: block;
  }
  #visualisation {
    height: 100%;
    display: none;
  }
  canvas {
    z-index: -1;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    display: none;
  }
  .time-controls {
    display: flex;
    align-items: center;
  }
  .time {
    flex-grow: 0;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
  }
  .progress {
    flex-grow: 1;
    margin: 0 0.5rem;
  }
  h4 {
    font-weight: 400;
    font-size: 1.25rem;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  h5 {
    font-weight: 400;
    font-size: 1rem;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .controls .btn {
    margin-left: 1rem;
    height: 45px;
    width: 45px;
    border-radius: 50%;
  }
  .controls .btn svg {
    width: 20px;
    margin-top: 5px;
  }
  .controls .btn-toggle {
    position: absolute;
    bottom: -20px;
    height: 25px;
    padding-left: 18px;
  }
  .controls .btn-toggle:hover {
    background: transparent;
  }
  .controls .btn-toggle:active {
    background: none;
  }
  .controls .btn:hover::before {
    display: none;
  }

  .details-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .text-details {
    width: 100%;
  }
  .controls {
    justify-content: center;
  }
  .controls-meta {
    justify-content: flex-end;
    position: absolute;
    bottom: 4px;
    right: -10px;
    padding-right: 0;
  }
  .controls-meta .btn {
    margin-left: 0.5rem;
    height: 35px;
    width: 35px;
    padding: 0;
  }
  .controls-meta .btn svg {
    width: 15x;
  }
  .floating-text-details {
    display: none;
    position: absolute;
    left: 220px;
    bottom: 9px;
    background: var(--background-floating-text);
    backdrop-filter: blur(10px);
    padding: 0 10px 5px;
    max-width: calc(100vw - 250px);
  }
  .classic-vis .floating-text-details {
    background: rgba(0, 0, 0, 0.6);
  }
  .floating-text-details h4 {
    font-size: 4rem;
  }
  .classic-vis .floating-text-details h4 {
    color: white;
  }
  .floating-text-details h5 {
    font-size: 2rem;
  }
  .classic-vis .floating-text-details h5 {
    color: white;
    --primary: lightgray;
    --primary-hover: gray;
  }
  .floating-text-details app-link {
    transition: all 0.2s ease-in-out 0s;
  }
  .bottom .playlist {
    height: calc(100vh - 155px);
  }
  .bottom .playlist lit-virtualizer {
    height: calc(100vh - 155px);
  }
  .bottom .playlist track-in-list {
    width: 100%;
    cursor: pointer;
  }
  .error {
    background: var(--background);
    height: 135px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    vertical-align: middle;
    justify-content: center;
  }
  @media (min-width: 576px) {
    #visualisation.active {
      display: block;
      width: 100vw;
      height: 100vh;
      position: absolute;
    }
    #visualisation.active canvas {
      display: block;
    }
    .details-wrapper {
      flex-direction: row;
    }
    .image-wrapper {
      max-height: calc(100vh - 50px - 85px);
    }
    .text-details {
      width: 33%;
      flex-grow: 0;
    }
    .controls {
      width: 33%;
      flex-grow: 1;
      padding-right: 0;
    }
    .error {
      height: 85px;
    }
    .controls .btn {
      margin-left: 1.5rem;
    }
    .controls .btn svg {
      height: 1.5rem;
      width: 1.5rem;
      margin: 5px 0;
    }
    .controls .btn-toggle {
      bottom: -14px;
      height: 25px;
      padding-left: 22px;
    }
    .controls-meta {
      position: static;
    }
    .controls-meta .btn {
      margin-left: 1rem;
      height: 45px;
      width: 45px;
    }
    .controls-meta .btn svg {
      width: 20x;
    }
    .time {
      background: var(--background-floating-text);
      backdrop-filter: blur(3px);
      padding: 0px 10px;
      margin: 0 -1px;
    }
    .smallArt .controls-wrapper {
      height: 85px;
      max-height: 85px;
    }
    .smallArt .current-album-art {
      height: 200px;
      width: 200px;
      margin: 0;
      bottom: 0.5rem;
      left: 0.5rem;
      position: absolute;
      padding: 0;
      border: 1px solid var(--background2);
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0px 0px 1px var(--primary);
      cursor: pointer;
      pointer-events: all;
    }
    .smallArt canvas {
      height: calc(100vh - 50px);
    }
    .smallArt .floating-text-details {
      display: block;
    }
    .smallArt .text-details {
      opacity: 0;
    }
    .bottom .playlist {
      padding: 0 10vw;
    }
    .bottom .playlist track-in-list {
      width: 80vw;
    }

    .album-art {
      position: relative;
    }
    .previous-album-art {
      display: none;
    }
    .next-album-art {
      display: none;
    }
  }
  /* notihng is playing */
  h3 {
    font-weight: 400;
  }
  app-link {
    color: var(--primary);
    transition: color 0.2s ease-in-out;
  }
  app-link .icon {
    width: 20px;
    margin: 0 0.25rem;
    display: inline-block;
    top: 5px;
    position: relative;
  }
  @media (min-width: 576px) {
    h3 {
      padding-top: 1.5rem;
    }
  }
`;
