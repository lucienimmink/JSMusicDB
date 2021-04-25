import { css } from 'lit-element';

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
    width: calc(100% - 1rem);
    padding: 0.5rem;
    border: 1px solid var(--primary, #006ecd);
    box-sizing: border-box;
    margin: 0.5rem;
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
    padding-top: 1.5rem;
    border-top: 0;
    height: auto;
  }
  .playlists li a {
    display: flex;
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
    text-decoration: none;
    align-items: center;
    height: 60px;
    width: 100%;
    padding-left: 1rem;
  }
  .playlists li a:hover {
    background: var(--background3);
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
    border-color: var(--primary, #006ecd);
    padding: 0.5rem 1rem;
  }
  loading-indicator {
    width: 180px;
    margin: 4rem auto 0;
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
      top: 100px;
    }
    .playlist {
      width: 70%;
    }
    loading-indicator {
      margin: calc(50vh - 106px) auto 0;
    }
  }
`;
