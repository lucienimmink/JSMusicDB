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
  .md-up {
    @media (min-width: 576px) {
      display: block;
    }
  }
  .md-up-inline {
    @media (min-width: 576px) {
      display: inline;
    }
  }
  .md-up-flex {
    @media (min-width: 576px) {
      display: flex;
    }
  }
  .lg-up {
    @media (min-width: 992px) {
      display: block;
    }
  }
  .lg-up-inline {
    @media (min-width: 992px) {
      display: inline;
    }
  }
  .lg-up-flex {
    @media (min-width: 992px) {
      display: flex;
    }
  }
  .sm-only {
    @media (min-width: 576px) {
      display: none;
    }
  }
  .lg-down {
    @media (min-width: 992px) {
      display: none;
    }
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
`;
