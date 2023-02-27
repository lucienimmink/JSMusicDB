import { css } from 'lit';

export default css`
  .dummy {
    filter: blur(4px);
    opacity: 0.8;
  }
  .jumbotron {
    color: var(--text-color);
    background: var(--background2, #f2f4f7);
    padding: 1rem;
    overflow: hidden;
    transition: all 0.1s ease-in-out;
  }
  album-art {
    flex: 0 0 125px;
    max-width: 125px;
    width: 125px;
    height: 125px;
    max-height: 125px;
    margin-right: 1rem;
    border: 1px solid var(--background, #f3f4f5);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
    transition: all 0.1s ease-in-out;
  }
  .details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  h2,
  h3,
  h4 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
    flex-grow: 0;
    font-weight: normal;
  }
  h2 {
    margin-top: -5px;
    font-size: 1.5rem;
    line-height: 1.3;
  }
  h3 {
    font-size: 1.2rem;
  }
  h4 {
    font-size: 1rem;
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
  @media (min-width: 992px) {
    .jumbotron {
      padding: 2rem;
      animation: jumbotron 1s linear infinite;
    }
    @keyframes jumbotron {
      to {
        backdrop-filter: blur(2px);
        background-color: var(--background2-seethrough);
        padding: 1rem 2rem;
      }
    }
    album-art {
      margin-left: -42px;
      flex: 0 0 190px;
      max-width: 190px;
      width: 190px;
      height: 190px;
      max-height: 190px;
      animation: album-art 1s linear infinite;
    }
    @keyframes album-art {
      to {
        flex: 0 0 75px;
        max-width: 75px;
        width: 75px;
        height: 75px;
        max-height: 75px;
      }
    }

    h3 .muted {
      opacity: 0;
      animation: h3muted 1s linear infinite;
    }
    @keyframes h3muted {
      to {
        opacity: 0.6;
      }
    }
    h2 {
      font-size: 2.5rem;
      animation: h2 1s linear infinite;
    }
    @keyframes h2 {
      to {
        font-size: 2rem;
        margin-top: 3px;
      }
    }
    h3,
    h4 {
      font-size: 1.5rem;
      overflow: hidden;
    }
    h3 {
      animation: h3 1s linear infinite;
    }
    @keyframes h3 {
      to {
        font-size: 1.2rem;
      }
    }
    h4 {
      transform-origin: center top;
      font-size: 1.1rem;
      animation: h4 1s linear infinite;
    }
    @keyframes h4 {
      25% {
        opacity: 0.25;
      }
      to {
        height: 0;
        opacity: 0;
      }
    }
    :host * {
      animation-play-state: paused !important;
      animation-delay: calc(var(--scroll) * -1s) !important;
      animation-iteration-count: 1 !important;
      animation-fill-mode: both !important;
    }
  }
`;
