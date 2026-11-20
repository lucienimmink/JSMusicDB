import { css } from 'lit';

export default css`
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .container {
    flex-direction: column;
    @media (min-width: 768px) {
      flex-direction: row;
    }
  }
  .playlists {
    width: 100%;

    .header {
      height: 60px;
      border-top: 1px solid transparent;
    }
    select {
      width: calc(100% - 2rem);
      box-sizing: border-box;
      margin: 1.85rem 1rem 0.5rem;
    }
    li {
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      transition: background-color 0.2s ease-in-out;
      min-height: 59px;
      align-items: center;
      border-bottom: 1px solid var(--border-colour);

      app-link {
        display: flex;
        color: var(--primary);
        transition: all 0.2s ease-in-out;
        text-decoration: none;
        align-items: center;
        height: 59px;
        width: 100%;
        padding-left: 1rem;

        &:hover {
          background: var(--background2);
          .btn-refresh {
            opacity: 1;
            pointer-events: all;
          }
        }
        .icon-note svg {
          width: 16px;
          display: inline-block;
          margin-left: 16px;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
      }
      .btn-refresh {
        opacity: 0;
        position: absolute;
        right: 10px;
        margin-top: -5px;
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
      }
      &.active {
        app-link {
          background: var(--background2);
          .icon-note svg {
            opacity: 1;
          }
        }
      }
    }
  }
  .playlist {
    width: 100%;

    li {
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      border-bottom: 1px solid var(--border-colour);
      padding: 0.5rem 1rem;
      transition: background-color 0.2s ease-in-out;
      min-height: 60px;
      width: 100%;

      &.header {
        display: block;
        padding: 1.85rem 1rem 0px;
        height: auto;
      }
      &.header:hover,
      &.no-hover:hover {
        backdrop-filter: blur(2px);
        background: var(--background-seethrough);
      }
    }
    track-in-list {
      display: flex;
      min-height: 60px;
      width: 100%;
      cursor: pointer;
    }
    .artist-selector {
      display: flex;
      align-items: center;
      select {
        width: 100%;
      }
    }
    .paste-playlist-selector {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 1rem;

      .alert {
        border: 1px solid red;
        background: rgba(255, 0, 0, 0.2);
        padding: 0.5rem 1rem;
      }
      label {
        margin-bottom: 0.25rem;
        cursor: pointer;
      }
      form div + div {
        margin-block-start: 1rem;
      }
    }
    @media (min-width: 768px) {
      width: 70%;
      .artist-selector select {
        margin-left: 1rem;
        max-width: 250px;
      }
    }
  }
  loading-indicator {
    width: 180px;
    margin: 4rem auto 0;
    @media (min-width: 768px) {
      margin: calc(50vh - 106px) auto 0;
    }
  }
  @media (min-width: 768px) {
    .playlists {
      width: 30%;
      ul {
        position: sticky;
        top: 0;
      }
    }
  }
  @media (min-width: 992px) {
    .playlists {
      ul {
        position: sticky;
        top: 100px;
      }
    }
  }
`;
