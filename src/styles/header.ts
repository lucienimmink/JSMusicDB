import { css } from 'lit';

export default css`
  ::-moz-selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  ::selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    flex-grow: 0;
    margin-right: 1rem;
    display: flex;
    align-items: center;
  }
  svg {
    width: 25px;
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
    align-items: center;
    height: 50px;
    font-weight: normal;
    padding-left: 1rem;
    transition: color 0.5s ease-in-out, background-color 0.5s ease-in-out;
  }
  h1 div {
    margin-top: -6px;
  }
  app-link {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }
  div {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  h1.customWindowControls div {
    max-width: calc(env(titlebar-area-width, 100%) - 60px);
    -webkit-app-region: drag;
    app-region: drag;
  }
  progress-spinner {
    display: inline-block;
    flex-grow: 0;
    margin: 23px -14px 0px 0px;
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
