import { css } from 'lit';

export default css`
  main-header {
    height: 50px;
    margin: 0;
    padding: 0;
    position: fixed;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: 100%;
    z-index: 4;
    view-transition-name: main-header;
  }
  letter-nav {
    position: fixed;
    left: 0;
    right: 0;
    top: 50px;
    z-index: 2;
    display: none;
    view-transition-name: letter-nav;
  }
  side-nav {
    display: none;
  }
  side-nav[full] {
    display: block;
  }
  #outlet {
    margin-top: 50px;
    display: block;
    padding-bottom: 50px;
    min-height: calc(100vh - 100px);
  }
  #outlet.player {
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
    view-transition-name: player;
  }
  track-info-modal {
    position: fixed;
    z-index: 5;
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
  @media (min-width: 992px) {
    side-nav {
      display: block;
    }
    #outlet {
      margin-top: 100px;
      margin-left: 75px;
      min-height: calc(100vh - 150px);
    }
    #outlet.player {
      min-height: calc(100vh - 190px);
    }
    letter-nav {
      display: block;
    }
  }
`;
