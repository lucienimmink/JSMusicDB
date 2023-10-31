import { css } from 'lit';

export default css`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: var(--progress-background, #f3f4f5);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--progress, #00417a);
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
    view-transition-name: side-nav-list;
  }
  li.title {
    position: sticky;
    background: var(--background2-seethrough);
    top: 0;
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
    transform: translateX(-100%);
    transition: transform 0.2s ease-in-out;
    top: 0;
  }
  .full ul {
    top: 0;
    height: 100%;
    width: 90%;
    max-width: 300px;
    background: var(--background2);
    border-right: 1px solid var(--border-colour);
    view-transition-name: full-side-nav-list;
  }
  .full.open {
    transform: translateX(-0);
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
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .full.open:before {
    opacity: 1;
  }
  .full li span {
    display: inline-block;
    margin-left: 0.75rem;
  }
  h1 {
    margin: 0 0 0 1rem;
    padding: 0;
    font-weight: 400;
    height: 50px;
    display: flex;
    align-items: center;
  }
  h1 div {
    height: 100%;
    padding-top: 8px;
  }
  h1 a {
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
    border: 1px solid var(--primary, #00417a);
    padding: 8px 10px;
    display: block;
    width: 90%;
    margin: 8px 13px;
  }
  input:focus {
    border-radius: 0;
    border: 1px solid var(--primary, #00417a);
  }
  @media (min-width: 576px) {
    input {
      width: 88%;
      margin: 8px 25px;
    }
  }
`;
