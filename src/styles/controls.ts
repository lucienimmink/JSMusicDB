import { css } from 'lit';

export default css`
  .controls {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .controls .btn {
    display: block;
    color: var(--text-color);
    background-color: transparent;
    border: 0;
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
    height: 100%;
    position: relative;
    opacity: 0.5;
  }
  .controls .btn svg {
    margin: 0 1px;
  }
  .controls .btn + .btn {
    margin: 0;
  }
  .controls .btn:hover {
    color: var(--primary);
    background: var(--background3);
    outline: none;
    opacity: 1;
  }
  .controls .btn:active,
  .controls .btn.active {
    background: var(--primary) !important;
    color: var(--letter-color) !important;
    opacity: 1;
  }
  .controls .btn:hover:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 9px;
    width: 100%;
    display: block;
    background-color: var(--primary);
    z-index: 1;
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
