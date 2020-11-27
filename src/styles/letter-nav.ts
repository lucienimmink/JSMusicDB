import { css } from 'lit-element';

export default css`
  ul {
    background-color: var(--primary);
    display: flex;
    height: 50px;
    flex-wrap: wrap;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: none;
    transition: background 0.2s ease-in-out;
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
    transition: background 0.2s ease-in;
  }
  app-link:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .active app-link {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
