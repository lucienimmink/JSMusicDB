import { css } from 'lit';

export default css`
  .container {
    display: block;
  }
  .album-details {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .album-details::before {
    top: anchor(--a top);
    width: anchor-size(--a width);
    height: anchor-size(--a height);
    content: '';
    position: absolute;
    background-color: var(--background2);
    transition:
      top 0.5s ease-in-out,
      height 0.5s ease-in-out;
  }
  track-in-list {
    cursor: pointer;
    display: block;
    position: relative;
    z-index: 1;
  }
  .header {
    z-index: 2;
  }
  .album-details:not(:hover) [isActive] {
    anchor-name: --a;
  }
  track-in-list:is(:hover, :focus-visible) {
    anchor-name: --a;
  }

  @media (min-width: 992px) {
    .container {
      padding-top: 257px;
    }
    album-details {
      position: fixed;
      width: 100vw;
      z-index: 3;
    }
  }
`;
