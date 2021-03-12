import { css } from 'lit-element';

export default css`
  .wrapper {
    color: var(--text-color);
    background: var(--background, #f8f9fa);
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    overflow: hidden;
  }
  .top {
    background: var(--background, #f8f9fa);
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 50px);
    position: relative;
    transition: transform 0.2s ease-in-out;
  }
  .bottom {
    z-index: 1;
    display: block;
    position: absolute;
    left: 0px;
    top: 105px;
    right: 0px;
    height: calc(100vh - 155px);
    overflow-y: auto;
  }
  .bottomShown .top {
    transform: translateY(calc(-100vh + 135px));
  }
  .image-wrapper {
    flex-grow: 1;
    position: relative;
    max-height: calc(100vh - 50px - 135px);
  }
  .current-album-art {
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    margin: 0px auto;
    z-index: 1;
    position: relative;
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
    text-shadow: 0 0 3px var(--background3);
  }
  .container {
    display: block;
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
  canvas.active {
    display: block;
  }
  .time-controls {
    display: flex;
    align-items: center;
  }
  .time {
    flex-grow: 0;
    white-space: nowrap;
    font-family: 'Lucida Console', Consolas, ui-monospace;
    text-shadow: 0 0 7px var(--background);
  }
  .progress {
    flex-grow: 1;
    margin: 0 0.5rem;
  }
  h4 {
    font-weight: 300;
    font-size: 1.3rem;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  h5 {
    font-weight: 300;
    font-size: 1.1rem;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .controls .btn {
    margin-left: 1rem;
    height: 45px;
    width: 45px;
  }
  .controls .btn svg {
    width: 20px;
  }
  .controls .btn-toggle {
    position: absolute;
    bottom: -11px;
    height: 25px;
  }
  .controls .btn-toggle:active {
    background: none;
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
  }
  .controls-meta .btn svg {
    width: 15x;
  }
  .floating-text-details {
    display: none;
    position: absolute;
    left: 220px;
    bottom: 10px;
    text-shadow: 0 0 7px var(--background);
    max-width: calc(100vw - 220px);
  }
  .floating-text-details h4 {
    font-size: 3rem;
    font-weight: 300;
  }
  .floating-text-details h5 {
    font-size: 2rem;
    font-weight: 300;
  }
  .floating-text-details app-link {
    transition: all 0.2s ease-in-out 0s;
  }
  .bottom lit-virtualizer {
    height: calc(100vh - 155px);
  }
  .bottom lit-virtualizer track-in-list {
    width: 100%;
    cursor: pointer;
  }
  @media (min-width: 576px) {
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
    .small .controls-wrapper {
      height: 85px;
      max-height: 85px;
    }
    .small .current-album-art {
      height: 200px;
      width: 200px;
      margin: 0;
      bottom: 0.5rem;
      left: 0.5rem;
      position: absolute;
      padding: 0;
      border: 1px solid var(--background3, #f3f4f5);
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0px 0px 1px var(--primary, #006ecd);
    }
    .small canvas {
      height: calc(100vh - 50px);
    }
    .small .floating-text-details {
      display: block;
    }
    .small .text-details {
      opacity: 0;
    }
    .bottom lit-virtualizer {
      padding: 0 10vw;
    }
    .bottom lit-virtualizer track-in-list {
      width: 80vw;
    }
  }
  /* notihng is playing */
  h3 {
    padding-top: 1.5rem;
    font-weight: 300;
  }
  app-link {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  app-link .icon {
    width: 20px;
    margin: 0 0.25rem;
    display: inline-block;
    top: 5px;
    position: relative;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: var(--progress-background, #f3f4f5);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--progress, #006ecd);
  }
`;
