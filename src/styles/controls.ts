import { css } from 'lit';

export default css`
  .controls {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .controls .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    color: var(--text-color);
    background-color: transparent;
    border: 0;
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
    position: relative;
    opacity: 1;
  }
  .controls .btn svg {
    margin: 0 1px;
  }
  .controls .btn + .btn {
    margin: 0;
  }
  .controls .btn:hover {
    color: var(--primary);
    background-color: var(--background3);
    outline: none;
  }
  .controls .btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .controls .btn:active,
  .controls .btn.active {
    background-color: var(--primary-subtle);
    color: var(--primary);
  }
  .controls .btn svg {
    width: 18px;
  }
  @media (min-width: 576px) {
    .controls .btn svg {
      width: 22px;
      margin: 3px 9px 0;
    }
  }
`;
