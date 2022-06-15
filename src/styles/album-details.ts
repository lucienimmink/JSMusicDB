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
    font-weight: 300;
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
    }
    album-art {
      --size: 190px;
      margin-left: -2rem;
      flex: 0 0 var(--size);
      max-width: var(--size);
      width: var(--size);
      height: var(--size);
      max-height: var(--size);
    }
    .shrink-1 album-art {
      --size: 150px;
    }
    .shrink-2 album-art {
      --size: 125px;
    }
    .shrink-3 album-art {
      --size: 100px;
    }
    .shrunk album-art {
      --size: 75px;
    }
    h3 .muted {
      opacity: 0;
    }
    h2 {
      font-size: 2.5rem;
      transition: all 0.1s ease-in-out;
    }
    h3,
    h4 {
      font-size: 1.5rem;
      overflow: hidden;
      transition: all 0.1s ease-in-out;
    }
    h4 {
      transform-origin: center top;
      font-size: 1.1rem;
    }
    .shrink-1 h2 {
      margin-top: -3px;
      font-size: 2.375rem;
    }
    .shrink-2 h2 {
      margin-top: -1px;
      font-size: 2.25rem;
    }
    .shrink-3 h2 {
      margin-top: 1px;
      font-size: 2.125rem;
    }
    .shrunk h2 {
      font-size: 2rem;
      margin-top: 3px;
    }
    .shrink-1 h3 {
      font-size: 1.425rem;
    }
    .shrink-2 h3 {
      font-size: 1.35rem;
    }
    .shrink-3 h3 {
      font-size: 1.275rem;
    }
    .shrunk h3 {
      font-size: 1.2rem;
    }
    .shrink-1 h3 .muted {
      opacity: 0.15;
    }
    .shrink-2 h3 .muted {
      opacity: 0.3;
    }
    .shrink-3 h3 .muted {
      opacity: 0.45;
    }
    .shrunk h3 .muted {
      opacity: 0.6;
    }
    .shrink-1 h4 {
      height: 0;
    }
    .shrink-2 h4 {
      height: 0;
    }
    .shrink-3 h4 {
      height: 0;
      opacity: 0.25;
    }
    .shrunk h4 {
      height: 0;
      opacity: 0;
    }
    .shrink-1 {
      padding: 1.75rem 2rem;
    }
    .shrink-2 {
      padding: 1.5rem 2rem;
      backdrop-filter: blur(0.5px);
      background-color: var(--background2-seethrough);
    }
    .shrink-3 {
      backdrop-filter: blur(1px);
      background-color: var(--background2-seethrough);
      padding: 1.25rem 2rem;
    }
    .shrunk {
      backdrop-filter: blur(2px);
      background-color: var(--background2-seethrough);
      padding: 1rem 2rem;
    }
  }
`;
