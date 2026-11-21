import { css } from 'lit';

export default css`
  button {
    font-family: inherit;
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
  }
  ul {
    list-style: none;
    position: fixed;
    top: 100px;
    left: 0;
    width: 74px;
    color: var(--text-color);
    background: var(--background2);
    overflow-x: hidden;
    overflow-y: auto;
    margin: 0;
    padding: 0.5rem 0 0;
    height: calc(100vh - 100px);
    transition:
      color 0.5s ease-in-out,
      background-color 0.5s ease-in-out,
      border-right-color 0.5s ease-in-out;
    border-right: 1px solid var(--border-colour);

    li.title {
      position: sticky;
      background: var(--background2-seethrough);
      top: 0;
      app-region: no-drag;
    }
    li {
      span {
        display: none;
      }
    }
  }
  .player {
    ul {
      height: calc(100vh - 100px - 81px);
    }
  }
  app-link {
    --menu-content-justify: center;

    display: block;
    color: var(--text-color);
    margin: 2px 6px;
    border-radius: var(--radius-medium);
    position: relative;
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;

    &:hover {
      background-color: var(--background3);
    }
    &:focus-within {
      outline: 2px solid var(--primary);
      outline-offset: -2px;
    }
  }
  svg {
    width: 20px;
  }
  .active {
    app-link {
      --text-color: var(--primary);

      color: var(--primary);
      background-color: var(--primary-subtle);

      &:hover {
        background-color: color-mix(
          in srgb,
          var(--primary) 18%,
          var(--background2)
        );
      }
    }
  }
  .full {
    backdrop-filter: blur(5px) grayscale(1);
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    transition: opacity 0.2s ease-in-out;
    z-index: 100;

    &.open {
      opacity: 1;
      pointer-events: all;
    }
    &:before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
    }
  }
  .slide-menu {
    position: fixed;
    inset: 0;
    max-width: 300px;
    background: var(--background2);
    transition: transform 0.2s ease-in-out;
    z-index: 101;
    transform: translateX(calc(-100% - 1px));
    view-transition-name: full-side-nav-list;

    &.open {
      transform: translateX(0);
    }
    app-link {
      --menu-content-justify: flex-start;
      @media (min-width: 576px) {
        padding-inline-start: 25px;
      }
    }
    ul {
      top: 0;
      height: 100%;
      width: 100%;
    }
    li {
      span {
        display: inline-block;
        margin-left: 0.75rem;
      }
    }
  }
  h1 {
    margin: 0 0 0 1rem;
    display: flex;
    font-weight: 600;
    height: 50px;
    align-items: center;
    color: var(--text-color);

    div {
      height: 100%;
      padding-top: 0;
      flex-grow: 1;
    }
    a,
    button {
      text-decoration: none;
      color: var(--primary);
      margin-right: 1rem;
      display: flex;
      align-items: center;
    }
    svg {
      width: 25px;
      fill: currentColor;
    }
    button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      justify-content: center;
      transition: background-color 0.2s ease-in-out;

      &:hover {
        background: var(--background3);
      }
      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
    }
    @media (min-width: 576px) {
      padding-inline: 10px;

      button {
        margin-right: 0;
      }
    }
  }
  input[type='search'] {
    width: calc(100% - 2rem);
    margin: 8px 1rem;
  }
`;
