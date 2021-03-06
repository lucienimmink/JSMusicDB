import { css } from 'lit-element';

export default css`
  main-header {
    height: 50px;
    margin: 0;
    padding: 0;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    background: var(--background, #f8f9fa);
    transition: background-color 0.5s ease-in-out;
    z-index: 2;
  }
  letter-nav {
    position: fixed;
    left: 0;
    right: 0;
    top: 50px;
    z-index: 2;
    display: none;
  }
  side-nav {
    display: none;
  }
  side-nav[full] {
    display: block;
  }
  app-main {
    margin-top: 50px;
    display: block;
    padding-bottom: 50px;
  }
  app-main.player {
    padding-bottom: 90px;
  }
  lit-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 81px;
    box-sizing: border-box;
    z-index: 2;
  }
  .loading-wrapper {
    background: var(--background);
    color: var(--text-color);
    z-index: 101;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  @media (min-width: 768px) {
    side-nav {
      display: block;
    }
    app-main {
      margin-top: 100px;
      margin-left: 75px;
    }
    letter-nav {
      display: block;
    }
  }
`;
