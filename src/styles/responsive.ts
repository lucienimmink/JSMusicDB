import { css } from 'lit';

export default css`
  .md-up,
  .md-up-inline {
    display: none;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
    border: 0;
  }
  @media (min-width: 576px) {
    .md-up {
      display: block;
    }
    .md-up-inline {
      display: inline;
    }
    .sm-only {
      display: none;
    }
  }
`;
