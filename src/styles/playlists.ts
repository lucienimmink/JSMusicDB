import { css } from 'lit';

export default css`
  .playlists .header {
    height: 61px;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .container {
    flex-direction: column;
  }
  .playlists {
    width: 100%;
  }
  .playlist {
    width: 100%;
  }
  .playlists select {
    width: calc(100% - 2rem);
    box-sizing: border-box;
    margin: 1.85rem 1rem 0.5rem;
  }
  .playlists li {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    transition: background-color 0.2s ease-in-out;
    min-height: 60px;
    align-items: center;
  }
  .playlist li.header {
    display: block;
    padding-top: 1.45rem;
    border-top: 0;
    height: auto;
  }
  .playlists li app-link {
    display: flex;
    color: var(--primary, #006ecd);
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    align-items: center;
    height: 60px;
    width: 100%;
    padding-left: 1rem;
  }
  .playlists li app-link:hover {
    background: var(--background3);
  }
  .playlists li .btn-refresh {
    opacity: 0;
    position: absolute;
    right: 10px;
    margin-top: -5px;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  }
  .playlists li app-link:hover .btn-refresh {
    opacity: 1;
    pointer-events: all;
  }
  .playlist li {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border-top: 1px solid var(--background3);
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease-in-out;
    min-height: 60px;
    width: 100%;
    cursor: pointer;
  }
  .playlist li:hover {
    background: var(--background3);
  }
  .playlist li.header:hover,
  .playlist li.no-hover:hover {
    backdrop-filter: blur(2px);
    background: var(--background-seethrough, rgba(248, 249, 250, 0.85));
  }
  .playlist li.active {
    background: var(--primary, #006ecd);
    color: var(--letter-color);
    transition: background-color 0.2s ease-in-out;
  }
  .playlist svg {
    width: 10px;
    display: inline-block;
  }
  .playlist .num {
    flex-grow: 0;
    width: 35px;
    min-width: 35px;
  }
  .playlist .title {
    flex-grow: 1;
  }
  .playlist .time {
    flex-grow: 0;
    text-align: end;
    width: 65px;
    min-width: 65px;
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
  }
  .playlist .artist-selector {
    display: flex;
    align-items: center;
  }
  .playlist .artist-selector select {
    width: 100%;
  }
  loading-indicator {
    width: 180px;
    margin: 4rem auto 0;
  }
  select {
    background: var(--background3);
    padding: 0.3rem 0.5rem;
    color: var(--text-color);
  }
  select:focus {
    outline: 2px solid var(--primary);
  }
  @media (min-width: 768px) {
    .playlist .artist-selector select {
      margin-left: 1rem;
      max-width: 250px;
    }
    .container {
      flex-direction: row;
    }
    .playlists {
      width: 30%;
    }
    .playlists ul {
      position: sticky;
      top: 0;
    }
    .playlist {
      width: 70%;
    }
    loading-indicator {
      margin: calc(50vh - 106px) auto 0;
    }
  }
  @media (min-width: 992px) {
    .playlists ul {
      position: sticky;
      top: 100px;
    }
  }
`;
