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
  }
  .details {
    display: flex;
    flex-direction: column;
    width: calc(100% - 127px - 1rem);
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
  }
  h2 span {
    -webkit-background-clip: text !important;
    -moz-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent;
    background: linear-gradient(90deg, var(--primary), var(--text-color));
  }
  h2 span {
    display: inline-block;
  }
  h2 span::selection {
    -webkit-text-fill-color: var(--letter-color);
  }
  h3 {
    font-size: 1.25rem;
  }
  h4 {
    font-size: 1rem;
    text-overflow: unset;
  }
  h4 + h4 {
    margin-top: 0.3rem;
  }
  h3 {
    flex-grow: 1;
  }
  h3 .muted svg,
  h4 .muted svg {
    width: 1rem;
    position: relative;
    top: 3px;
    transition: all 0.1s ease-in-out;
  }
  h3 .muted svg {
    top: 2px;
  }
  h4 span {
    display: none;
  }
  dialog {
    border: 1px solid var(--background2);
    box-shadow: 0px 0px 1px var(--primary);
    padding: 0;
    opacity: 0;
    transition: all 0.2s ease-in-out;
  }
  dialog[open] {
    opacity: 1;
  }
  @starting-style {
    dialog[open] {
      opacity: 0;
    }
  }
  dialog::backdrop {
    backdrop-filter: blur(0px) grayscale(0);
    transition: all 0.2s ease-in-out;
  }
  dialog[open]::backdrop {
    backdrop-filter: blur(5px) grayscale(1);
  }
  @starting-style {
    dialog[open]::backdrop {
      backdrop-filter: blur(0px) grayscale(0);
    }
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
  @media (min-width: 992px) {
    .jumbotron {
      padding: 2rem;
      animation: jumbotron;
    }
    @keyframes jumbotron {
      to {
        backdrop-filter: blur(2px);
        background-color: var(--background2-seethrough);
        padding: 1rem 2rem;
      }
    }
    .details {
      width: calc(100% - 190px - 1rem);
    }
    album-art {
      margin-left: -42px;
      flex: 0 0 190px;
      max-width: 190px;
      width: 190px;
      height: 190px;
      max-height: 190px;
      animation: album-art-shrink;
    }
    dialog album-art {
      animation: none;
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

    h3 .muted {
      opacity: 0;
      animation: h3muted;
    }
    @keyframes h3muted {
      to {
        opacity: 0.6;
      }
    }
    h2 {
      font-size: 2.5rem;
      animation: h2;
    }
    @keyframes h2 {
      to {
        font-size: 2rem;
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
    h4 span {
      display: inline;
    }
    @keyframes h3 {
      to {
        font-size: 1.2rem;
      }
    }
    @keyframes h4-text {
      25% {
        opacity: 0.25;
      }
      to {
        height: 0;
        opacity: 0;
      }
    }
    h4 {
      transform-origin: center top;
      font-size: 1rem;
      animation: h4-text;
    }
    :host * {
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      animation-timeline: scroll(root);
      animation-range: 0 160px;
    }
  }
`;
