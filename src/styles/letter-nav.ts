import { css } from 'lit';

export default css`
  ::-moz-selection {
    background-color: var(--letter-color);
    color: var(--primary);
  }
  ::selection {
    background-color: var(--letter-color);
    color: var(--primary);
  }
  ul {
    background-color: var(--primary);
    display: flex;
    height: 50px;
    flex-wrap: wrap;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: none;
    transition: background-color 0.5s ease-in-out;
    view-transition-name: letter-nav-list;
  }
  li {
    text-align: center;
    align-self: stretch;
    flex-grow: 1;
    box-sizing: border-box;
  }
  app-link {
    color: var(--letter-color);
    cursor: pointer;
    display: block;
    height: 100%;
    transition: background-color 0.5s ease-in-out;
  }
  app-link:hover {
    background-color: var(--letter-background-hover);
  }
  .active app-link {
    background-color: var(--letter-background-active);
  }
`;
