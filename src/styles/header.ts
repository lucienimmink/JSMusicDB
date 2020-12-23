import { css } from 'lit-element';

export default css`
  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }
  svg {
    width: 20px;
  }
  h1 {
    background: var(--background3, #e9ecef);
    color: var(--text-color);
    margin: 0px;
    padding: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: block;
    height: 50px;
    font-weight: 300;
    padding-left: 10px;
    transition: color 0.5s ease-in-out, background-color 0.5s ease-in-out;
  }
  app-link {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  progress-spinner {
    position: absolute;
    right: -10px;
    top: -14px;
    font-size: 0.8rem;
  }
  @media (min-width: 576px) {
    .md-up {
      display: inline;
    }
  }
`;
