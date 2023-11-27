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
  a,
  button {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    flex-grow: 0;
    margin-right: 1rem;
    display: flex;
    align-items: center;
  }
  button {
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
  }
  svg {
    width: 25px;
  }
  h1 {
    backdrop-filter: blur(2px);
    background: var(--background2-seethrough);
    color: var(--text-color);
    margin: 0px;
    padding: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: flex;
    align-items: center;
    height: 50px;
    font-weight: 400;
    padding-left: 1rem;
    transition:
      color 0.5s ease-in-out,
      background-color 0.5s ease-in-out;
  }
  h1 div {
    height: 100%;
    padding-top: 8px;
  }
  app-link {
    color: var(--primary);
    transition: color 0.2s ease-in-out;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }
  div {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    view-transition-name: main-header-text;
  }
  h1.customWindowControls div {
    max-width: calc(env(titlebar-area-width, 100%) - 60px);
    -webkit-app-region: drag;
    app-region: drag;
  }
  progress-spinner {
    display: inline-block;
    flex-grow: 0;
    margin: 25px -14px 0px 0px;
    font-size: 0.875rem;
  }
  @media (min-width: 576px) {
    .md-up {
      display: inline;
    }
    h1 {
      background: var(--background2);
    }
    h1.playing {
      background: var(--background2-seethrough);
      backdrop-filter: blur(5px);
    }
  }
`;
