import { css } from 'lit';

export default css`
  button {
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
    padding: 0;
    height: calc(100vh - 100px);
    transition:
      color 0.5s ease-in-out,
      background-color 0.5s ease-in-out;
    border-right: 1px solid var(--border-colour);
  }
  li.title {
    position: sticky;
    background: var(--background2-seethrough);
    top: 0;
    app-region: no-drag;
  }
  .player ul {
    height: calc(100vh - 100px - 81px);
  }
  app-link {
    display: block;
    color: var(--text-color);
    border-left: 3px solid transparent;
    opacity: 0.5;
    transition:
      color 0.5s ease-in-out,
      background-color 0.5s ease-in-out,
      opacity 0.2s ease-in-out;
  }
  app-link:hover {
    opacity: 1;
    background: var(--background3);
  }
  svg {
    width: 20px;
  }
  .active app-link {
    color: black;
    border-left-color: var(--primary);
    transition: border-left-color 0.2s ease-in-out;
    opacity: 1;
  }
  li span {
    display: none;
  }
  .full {
    backdrop-filter: blur(5px);
    position: fixed;
    height: 100%;
    z-index: 100;
    width: 100%;
    transition: opacity 0.2s ease-in-out;
    top: 0;
    opacity: 0;
    pointer-events: none;
  }
  .full.open {
    opacity: 1;
    pointer-events: all;
  }
  .full:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }
  .slide-menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    max-width: 300px;
    background: var(--background2);
    transition: transform 0.2s ease-in-out;
    z-index: 101;
    transform: translateX(-100%);
    view-transition-name: full-side-nav-list;
  }
  .slide-menu.open {
    transform: translateX(0);
  }
  .slide-menu ul {
    top: 0;
    height: 100%;
    width: 100%;
  }
  .slide-menu li span {
    display: inline-block;
    margin-left: 0.75rem;
  }
  h1 {
    margin: 0 0 0 1rem;
    display: flex;
    font-weight: 400;
    height: 50px;
    align-items: center;
  }
  h1 div {
    height: 100%;
    padding-top: 15px;
    flex-grow: 1;
  }
  h1 a,
  h1 button {
    text-decoration: none;
    color: var(--primary);
    margin-right: 1rem;
    display: flex;
    align-items: center;
  }
  h1 svg {
    width: 25px;
  }
  input {
    border: 1px solid var(--primary);
    padding: 8px 10px;
    display: block;
    width: 90%;
    margin: 8px 13px;
  }
  input:focus {
    border-radius: 0;
    border: 1px solid var(--primary);
  }
  @media (min-width: 576px) {
    input {
      width: 88%;
      margin: 8px 25px;
    }
    h1 {
      padding-inline: 10px;
    }
  }
`;
