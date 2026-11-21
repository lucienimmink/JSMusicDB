import { css } from 'lit';

export default css`
  .controls {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 44px;
      aspect-ratio: 1/1;
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
      svg {
        width: 24px;
      }
      & + .btn {
        margin: 0;
      }
      &:hover {
        color: var(--primary);
        background-color: var(--background3);
        outline: none;
      }
      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
      &:active,
      &.active {
        background-color: var(--primary-subtle);
        color: var(--primary);
      }
    }
  }
  @media (min-width: 576px) {
    .controls {
      .btn {
        width: 60px;
        .svg {
          width: 33px;
        }
      }
    }
  }
`;
