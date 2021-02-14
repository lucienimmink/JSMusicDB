import { css } from 'lit-element';

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
  @media (min-width: 768px) {
    .jumbotron {
      padding: 2rem;
    }
    album-art {
      flex: 0 0 175px;
      max-width: 175px;
      width: 175px;
      height: 175px;
      max-height: 175px;
      margin-left: -2rem;
    }
    .shrunk album-art {
      flex: 0 0 75px;
      max-width: 75px;
      width: 75px;
      height: 75px;
      max-height: 75px;
    }
    h3 .muted {
      opacity: 0;
    }
    h2 {
      font-size: 2.5rem;
      margin-top: 3px;
      transition: all 0.1s ease-in-out;
    }
    h3,
    h4 {
      font-size: 1.5rem;
      overflow: hidden;
      transition: all 0.1s ease-in-out;
    }
    h4 {
      font-size: 1.1rem;
    }
    .shrunk h2 {
      font-size: 2rem;
    }
    .shrunk h3 {
      font-size: 1.2rem;
    }
    .shrunk h3 .muted {
      opacity: 0.6;
    }
    .shrunk h4 {
      height: 0;
      opacity: 0;
    }
    .shrunk {
      background-color: var(--background2-seethrough, var(--background2));
      padding: 1rem 2rem;
    }
  }
  @media (min-width: 992px) {
    album-art {
      flex: 0 0 190px;
      max-width: 190px;
      width: 190px;
      height: 190px;
      max-height: 190px;
    }
  }
`;
