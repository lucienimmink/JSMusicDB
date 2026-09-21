import { css } from 'lit';

export default css`
  .md-up,
  .md-up-inline,
  .md-up-flex,
  .lg-up,
  .lg-up-inline,
  .lg-up-flex {
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
  .md-down {
    display: block;
  }
  @media (min-width: 576px) {
    .md-up {
      display: block;
    }
    .md-up-inline {
      display: inline;
    }
    .md-up-flex {
      display: flex;
    }
    .sm-only {
      display: none;
    }
  }
  @media (min-width: 992px) {
    .lg-down {
      display: none;
    }
    .lg-up {
      display: block;
    }
    .lg-up-inline {
      display: inline;
    }
    .lg-up-flex {
      display: flex;
    }
  }
`;
