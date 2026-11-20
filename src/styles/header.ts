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
    font-family: inherit;
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
    width: 36px;
    height: 36px;

    &:hover {
      background: var(--background3);
    }
    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
    @media (min-width: 576px) {
      padding: 0;
    }
  }
  svg {
    width: 25px;
    fill: currentColor;
  }
  h1 {
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
    font-weight: 600;
    padding-left: 1rem;
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
    div {
      height: 100%;
      padding-top: 0;
    }
    &.customWindowControls div {
      max-width: calc(env(titlebar-area-width, 100%) - 60px);
      app-region: drag;
    }
    .album {
      color: var(--primary);
      display: inline-block;
    }
    @media (min-width: 576px) {
      background: var(--background2);
      &.playing {
        background: var(--background2-seethrough);
      }
    }
  }
  app-link {
    color: var(--primary);
    transition: color 0.2s ease-in-out;
    app-region: no-drag;
  }
  div {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    view-transition-name: main-header-text;
  }
  progress-spinner {
    display: inline-block;
    flex-grow: 0;
    margin: 25px -14px 0px 0px;
    font-size: 0.875rem;
  }
  .md-up {
    @media (min-width: 576px) {
      display: inline;
    }
  }
`;
