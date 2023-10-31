import { css } from 'lit';

export default css`
  .controls {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-right: 1rem;
    align-items: center;
  }
  .controls .btn {
    color: var(--text-color);
    width: 35px;
    height: 35px;
    border: 0;
    border-radius: 50%;
    background: none;
    margin-left: 0.5rem;
    line-height: normal;
    padding: 0;
    transition: all 0.2s ease-in-out;
  }
  .controls .btn:hover,
  .controls .btn:focus {
    color: var(--primary);
    outline: none;
  }
  .controls .btn:active,
  .controls .btn.active {
    border: 0;
    background: var(--primary);
    color: var(--letter-color);
  }
  .controls .btn svg {
    width: 18px;
  }
  .controls .btn + .btn {
    margin-left: 0.5rem;
  }
  @media (min-width: 576px) {
    .controls .btn {
      width: 50px;
      height: 50px;
    }
    .controls .btn svg {
      width: 22px;
    }
  }
`;
