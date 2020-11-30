import { css } from 'lit-element';

export default css`
  li {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border-top: 1px solid var(--background3);
    padding: 0.5rem 1rem;
    transition: background 0.2s ease-in-out;
    min-height: 60px;
  }
  li:hover {
    background: var(--background3);
  }
  li.active {
    background: var(--primary, #006ecd);
    color: var(--letter-color);
    transition: color 0.2s ease-in-out;
  }
  .num {
    flex-grow: 0;
    width: 35px;
    min-width: 35px;
  }
  .title {
    flex-grow: 1;
  }
  .time {
    flex-grow: 0;
    text-align: end;
    width: 65px;
    min-width: 65px;
  }
  .if-active {
    display: none;
  }
  svg {
    width: 15px;
    display: block;
    margin-top: 6px;
  }
  .active .if-active {
    display: inline;
  }
`;
