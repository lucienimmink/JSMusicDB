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
  h3,
  h4 {
    font-size: 1.2rem;
  }
  h3 {
    flex-grow: 1;
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
    h2 {
      font-size: 2.5rem;
    }
    h3,
    h4 {
      font-size: 1.5rem;
    }
    .shrunk h4 {
      display: none;
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
