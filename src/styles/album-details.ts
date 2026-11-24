import { css } from 'lit';

export default css`
  .dummy {
    filter: blur(4px);
    opacity: 0.8;
  }
  .jumbotron {
    color: var(--text-color);
    background: var(--background2);
    padding: 1rem;
    overflow: hidden;
    transition: all 0.1s ease-in-out;
    border-bottom: 1px solid var(--border-colour);
    @media (min-width: 992px) {
      padding: 2rem;
      animation: jumbotron;
    }
  }
  album-art {
    flex: 0 0 125px;
    max-width: 125px;
    width: 125px;
    height: 125px;
    max-height: 125px;
    margin-right: 1rem;
    border: 1px solid var(--background);
    box-shadow: 0px 0px 1px var(--primary);
    transition: all 0.1s ease-in-out;
    view-transition-name: album-art;
    cursor: pointer;
    @media (min-width: 992px) {
      margin-left: -42px;
      flex: 0 0 190px;
      max-width: 190px;
      width: 190px;
      height: 190px;
      max-height: 190px;
      animation: album-art-shrink;
    }
  }
  .details {
    display: flex;
    flex-direction: column;
    width: calc(100% - 127px - 1rem);
    @media (min-width: 992px) {
      width: calc(100% - 190px - 1rem);
    }
  }
  h2,
  h3,
  h4 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
    flex-grow: 0;
    font-weight: 400;
  }
  h2 {
    margin-top: -5px;
    font-size: 1.5rem;
    span {
      -webkit-background-clip: text !important;
      -moz-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent;
      background: linear-gradient(90deg, var(--primary), var(--text-color));
      display: inline-block;

      &::selection {
        -webkit-text-fill-color: var(--letter-color);
      }
    }
  }
  h3 {
    font-size: 1.25rem;
    flex-grow: 1;
  }
  h4 {
    font-size: 1rem;
    text-overflow: unset;
    & + h4 {
      margin-top: 0.3rem;
    }
    .muted svg {
      width: 1rem;
      position: relative;
      top: 3px;
      transition: all 0.1s ease-in-out;
    }
    span {
      display: none;
    }
  }
  h3 .muted svg {
    width: 1rem;
    position: relative;
    top: 3px;
    transition: all 0.1s ease-in-out;
  }
  h3 {
    .muted svg {
      top: 2px;
    }
  }
  dialog {
    border: 1px solid var(--background2);
    box-shadow: 0px 0px 1px var(--primary);
    padding: 0;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    outline: none;
    &.album-art-modal {
      border: 0;
      background: transparent;
      box-shadow: none;
    }
    &[open] {
      opacity: 1;
    }
    @starting-style {
      &[open] {
        opacity: 0;
      }
    }
    &::backdrop {
      backdrop-filter: blur(0px) grayscale(0);
      transition: all 0.2s ease-in-out;
    }
    &[open]::backdrop {
      backdrop-filter: blur(5px) grayscale(1);
    }
    @starting-style {
      &[open]::backdrop {
        backdrop-filter: blur(0px) grayscale(0);
      }
    }
    .close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      box-sizing: border-box;
      width: 3rem;
      height: 3rem;
      padding: 0;
      border-radius: 50%;
      background-color: var(--background2-seethrough);
      color: var(--primary);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 2px solid transparent;
      outline: none;
      svg {
        display: block;
        flex: none;
        width: 2rem;
        height: 2rem;
      }
      &:hover {
        background-color: var(--background3);
      }
      &:focus {
        border: 2px solid var(--primary);
      }
      &:active {
        background-color: var(--background2);
      }
    }
    album-art {
      margin-right: 0;
      margin-left: 0;
      display: block;
      max-width: 97vw;
      max-height: 97vw;
      width: auto;
      height: auto;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      cursor: pointer;
    }
    &.album-art-modal album-art {
      border: 1px solid var(--background2);
      box-shadow: 0px 0px 1px var(--primary);
    }
    .now-playing {
      box-sizing: border-box;
      background: var(--background2-seethrough);
      margin: 0.75rem 0 0;
      padding: 0.5rem;
      color: var(--text-color);
      display: grid;
      grid-template-columns: 40px 1fr 40px;
      justify-content: center;
      align-items: center;
      gap: 1rem;

      .playing {
        display: flex;
        gap: 1rem;
        align-items: center;
        overflow: hidden;

        .title {
          color: var(--primary);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      svg {
        width: 1rem;
        min-width: 1rem;
      }
      .controls {
        .btn {
          outline: none;
          border: 0;
          height: 40px;
          width: 40px;
          background-color: transparent;
          color: var(--text-color);
          display: flex;
          justify-content: center;
          align-items: center;
          &:hover {
            color: var(--primary);
            background-color: var(--background3);
            outline: none;
          }
          &:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }
          &:active,
          &.active {
            background-color: var(--primary-subtle);
            color: var(--primary);
          }
        }
      }
      .time {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .current {
          color: var(--primary);
        }
      }
    }
  }
  @media (orientation: landscape) {
    dialog {
      album-art {
        max-width: 90vh;
        max-height: 90vh;
      }
    }
  }
  @media (min-width: 992px) {
    @keyframes jumbotron {
      to {
        backdrop-filter: blur(2px);
        background-color: var(--background2-seethrough);
        padding: 1rem 2rem;
      }
    }
    dialog {
      album-art {
        animation: none;
      }
      .now-playing {
        margin-top: 0.75rem;
        grid-template-columns: 40px 1fr 90px;

        .title {
          font-size: 1.5rem;
        }
      }
    }
    @keyframes album-art-shrink {
      to {
        flex: 0 0 75px;
        max-width: 75px;
        width: 75px;
        height: 75px;
        max-height: 75px;
        margin-right: 0.5rem;
      }
    }

    h3 {
      .muted {
        opacity: 0;
        animation: h3muted;
      }
    }
    @keyframes h3muted {
      to {
        opacity: 0.6;
      }
    }
    h2 {
      font-size: 3rem;
      animation: h2;
      span {
        display: inline;
      }
    }
    @keyframes h2 {
      to {
        font-size: 2.5rem;
      }
    }
    h3,
    h4 {
      font-size: 1.5rem;
      overflow: hidden;
    }
    h3 {
      animation: h3;
    }
    h4 {
      span {
        display: inline;
      }
    }
    @keyframes h3 {
      to {
        font-size: 1.2rem;
      }
    }
    @keyframes h4-text {
      to {
        height: 0;
        opacity: 0;
        transform: scale(0);
      }
    }
    h4 {
      transform-origin: center top;
      font-size: 1rem;
      animation: h4-text;
      height: 1.3rem;
      overflow: visible;
    }
    h4 {
      & + h4 {
        height: 2.5rem;
      }
    }
    :host * {
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      animation-timeline: scroll(root);
      animation-range: 0 160px;
      transform-origin: left;
    }
  }
`;
