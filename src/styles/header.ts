import { css } from 'lit';

export default css`
  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    flex-grow: 0;
    margin-right: 1rem;
  }
  svg {
    width: 20px;
  }
  h1 {
    backdrop-filter: blur(2px);
    background: var(--background3-seethrough, #e9ecef);
    color: var(--text-color);
    margin: 0px;
    padding: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: flex;
    height: 50px;
    font-weight: 300;
    padding-left: 10px;
    transition: color 0.5s ease-in-out, background-color 0.5s ease-in-out;
  }
  app-link {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  div {
    flex-grow: 1;
    white-space: nowrap;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  progress-spinner {
    display: inline-block;
    flex-grow: 0;
    margin: -14px -10px 0 0;
    font-size: 0.8rem;
  }
  @media (min-width: 576px) {
    .md-up {
      display: inline;
    }
    h1 {
      background: var(--background3, #e9ecef);
    }
  }
`;
