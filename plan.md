# DLNA support plan

## Problem and approach

JSMusicDB currently plays its own library through an HTML audio element and a
node-mp3stream backend. As a browser-only frontend, it cannot perform SSDP
discovery or reliably control DLNA devices itself. Add frontend support that
consumes DLNA discovery, browsing, and renderer-control APIs provided by
node-mp3stream. The server-side implementation will be done separately by the
user.

Support both DLNA MediaServers (discover and browse their media) and
MediaRenderers (discover and select a playback destination). Keep the existing
local player behavior intact. Allow sending the current track or a playlist to
a renderer, and handle tracks browsed from a DLNA MediaServer. Surface API and
device errors in the UI rather than silently falling back to local playback.

## Todos

1. Define typed frontend service/API expectations for device discovery,
   MediaServer browsing, and renderer transport, using the configured
   node-mp3stream server and JWT.
2. Add a DLNA browsing/device UI to discover MediaServers, navigate their
   content, and choose a MediaRenderer.
3. Integrate playback actions for DLNA-sourced media and send current tracks
   and playlists to the chosen renderer, preserving the existing local player.
4. Add focused tests where supported, update directly related documentation,
   and run the relevant checks/build.

## Considerations

- The API endpoints and payloads do not exist in this repository yet. Agree on
  their exact paths, request/response shapes, and error semantics with the
  upcoming node-mp3stream server work before implementing the client.
- Renderer playback needs a stream URL reachable by the renderer; the backend
  should provide or construct an appropriate URL and handle authentication or
  transcoding requirements. A browser-local authenticated URL is not
  automatically reachable by another device.
- DLNA server browsing and renderer playback are distinct flows. Do not assume
  that content returned by a MediaServer can be treated as a JSMusicDB library
  track without mapping its metadata and resource URL.
- Keep existing local playback, playlist persistence, and controls unchanged
  unless the user explicitly selects a DLNA device or DLNA content.
