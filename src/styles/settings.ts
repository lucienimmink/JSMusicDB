import { css } from 'lit-element';

export default css`
  .btn-small {
    margin-left: 1rem;
  }
  .container {
    display: block;
  }
  p {
    margin: 0.5rem 1rem 0.7rem;
    display: flex;
    align-items: center;
  }
  .radio-group {
    display: block;
    position: relative;
  }
  .switch {
    position: relative;
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 20px;
    border-radius: 10px;
    padding: 0;
    background-color: transparent;
    border: 2px solid var(--text-color);
    margin-left: 0.5rem;
    transition: background-color 0.5s ease-in-out color 0.5s ease-in-out;
  }
  .switch:before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    top: 3px;
    left: 3px;
    border-radius: 5px;
    transition: left 0.1s;
    background-color: var(--text-color);
    transition: background-color 0.2s ease-in-out color 0.2se ease-in-out;
  }
  .switch.on {
    background-color: var(--primary, #006ecd);
  }
  .switch.on:before {
    left: 27px;
    background-color: white;
  }
  .radio-group label {
    padding-left: 0;
    margin-left: 28px;
    min-height: 0;
    line-height: 20px;
    cursor: pointer;
  }
  .radio {
    width: 20px;
    height: 20px;
    margin-left: -28px;
    margin-top: 0;
    opacity: 0;
  }
  .radio + span:before {
    border-width: 1px;
    border-style: solid;
    box-sizing: border-box;
    content: '';
    height: 20px;
    width: 20px;
    position: absolute;
    margin-top: 4px;
    left: 0;
    cursor: pointer;
    border-radius: 100%;
  }
  .radio.on + span:before {
    content: '•';
    text-indent: 0;
    line-height: 6px;
    padding-top: 9px;
    font-size: 64px;
  }
`;
