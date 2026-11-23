# PlaybackTarget and DLNA renderer support plan

## Goal

Introduce a PlaybackTarget abstraction in JSMusicDB so playback is no longer
tightly coupled to the local HTMLAudioElement.

The existing browser player remains the default playback target. Add support for
remote playback targets exposed by node-mp3stream, initially DLNA/UPnP
MediaRenderers.

JSMusicDB remains the playback authority. It continues to own:

- the current playlist
- the current playlist index
- shuffle state
- previous/next track selection
- continuous play
- persisted playback position
- Last.fm and ListenBrainz scrobbling
- Media Session integration where applicable
- now-playing UI state
- selected playback target

node-mp3stream is not the owner of the playlist or playback session. It provides
discovery and remote-renderer control.

Do not add DLNA MediaServer browsing as part of this implementation. MediaServer
browsing is a separate media-source concern and should not be coupled to
PlaybackTarget.

## Current architecture

The current player implementation is primarily located in:

- `src/components/player/player.ts`
- `src/components/now-playing/now-playing.ts`
- `src/utils/player.ts`
- `src/utils/node-mp3stream.ts`
- `src/LitMusicdb.ts`

Playback state is distributed through the existing EventBus.

`src/utils/player.ts` persists the current playlist, playback position and
shuffle state in IndexedDB.

`src/components/player/player.ts` currently combines several responsibilities:

1. playlist navigation
2. HTMLAudioElement playback
3. AudioContext lifecycle
4. ReplayGain
5. Media Session integration
6. playback state publication
7. Last.fm scrobbling
8. ListenBrainz scrobbling
9. track navigation
10. UI rendering

The first target of the refactoring is to isolate the audio-output-specific
behaviour without changing the existing playlist semantics.

## Architecture

Introduce:

    PlaybackController
            |
            v
      PlaybackTarget
        /       \
       /         \
BrowserTarget   RemoteTarget
     |               |
HTMLAudioElement     node-mp3stream HTTP API
AudioContext              |
                          v
                    DLNA renderer

The controller selects tracks and maintains the functional playback lifecycle.

PlaybackTarget only represents where playback is executed.

## New source structure

Add:

    src/playback/
      types.ts
      PlaybackTarget.ts
      PlaybackController.ts

      browser/
        BrowserPlaybackTarget.ts

      remote/
        PlaybackApi.ts
        PlaybackEvents.ts
        RemotePlaybackTarget.ts

Do not create a separate shared npm package at this stage.

Keep the implementation local to JSMusicDB until the contracts demonstrate
that sharing code with node-mp3stream is useful.

## Core types

In `src/playback/types.ts` define:

    export type PlaybackTargetType =
      | 'browser'
      | 'dlna';

    export interface PlaybackCapabilities {
      play: boolean;
      pause: boolean;
      stop: boolean;
      seek: boolean;
      volume: boolean;
      mute: boolean;
    }

    export interface PlaybackTargetDescriptor {
      id: string;
      type: PlaybackTargetType;
      name: string;

      manufacturer?: string;
      model?: string;

      available: boolean;
      capabilities: PlaybackCapabilities;
    }

    export type PlaybackTransportState =
      | 'idle'
      | 'loading'
      | 'playing'
      | 'paused'
      | 'stopped'
      | 'transitioning'
      | 'error'
      | 'unknown';

    export interface PlaybackState {
      targetId: string;
      transport: PlaybackTransportState;

      mediaId?: string;
      positionMs?: number;
      durationMs?: number;

      volume?: number;
      muted?: boolean;

      updatedAt?: string;
    }

## PlaybackTarget contract

Create `src/playback/PlaybackTarget.ts`.

The initial contract is:

    export interface PlaybackTarget {
      readonly descriptor: PlaybackTargetDescriptor;

      load(
        track: any,
        options?: {
          autoplay?: boolean;
          positionMs?: number;
        },
      ): Promise<void>;

      play(): Promise<void>;
      pause(): Promise<void>;
      stop(): Promise<void>;
      seek(positionMs: number): Promise<void>;

      getState(): Promise<PlaybackState>;

      setVolume?(volume: number): Promise<void>;
      setMuted?(muted: boolean): Promise<void>;
    }

Do not expose queue operations on PlaybackTarget.

In particular, do not add:

- next()
- previous()
- shuffle()
- setQueue()

Those responsibilities remain in JSMusicDB.

## BrowserPlaybackTarget

Move browser-specific playback behaviour from
`src/components/player/player.ts` into
`src/playback/browser/BrowserPlaybackTarget.ts`.

BrowserPlaybackTarget owns:

- HTMLAudioElement access
- stream URL creation for `/listen`
- calling play/pause
- setting currentTime
- AudioContext creation
- requested sample-rate handling
- MediaElementAudioSourceNode creation
- browser playback events
- browser volume

Preserve the current sample-rate behaviour.

The existing player creates:

    new AudioContext({ sampleRate: track.samplerate })

and replaces the AudioContext when the requested sample rate changes.

Retain this behaviour.

Also retain `window._source` for the first implementation because
`now-playing.ts` currently uses it for AudioMotionAnalyzer.

Do not refactor the visualizer and PlaybackTarget simultaneously.

A later cleanup can replace the global audio source with an explicit context
provider.

## RemotePlaybackTarget

Create `src/playback/remote/RemotePlaybackTarget.ts`.

RemotePlaybackTarget should implement PlaybackTarget by calling the
node-mp3stream playback API.

It must not contain UPnP/DLNA protocol implementation.

Example operations:

    load(track)
      -> PUT /api/playback/targets/:id/media

    play()
      -> POST /api/playback/targets/:id/play

    pause()
      -> POST /api/playback/targets/:id/pause

    stop()
      -> POST /api/playback/targets/:id/stop

    seek(positionMs)
      -> PUT /api/playback/targets/:id/position

    getState()
      -> GET /api/playback/targets/:id/state

All control requests use:

    Authorization: Bearer <jwt>

Do not use the JWT query-string pattern used by the existing `/listen`
endpoint for new playback-control APIs.

## Playback API client

Create:

    src/playback/remote/PlaybackApi.ts

Keep HTTP details out of the target implementation where practical.

Expose at least:

    getTargets()
    discoverTargets()

    loadMedia(targetId, request)

    play(targetId)
    pause(targetId)
    stop(targetId)
    seek(targetId, positionMs)

    getState(targetId)

    setVolume(targetId, volume, muted?)

Use the existing `getServer()` and `getJwt()` helpers.

Do not duplicate server/JWT persistence.

## Target selection

JSMusicDB always has a local browser target:

    {
      id: 'browser:local',
      type: 'browser',
      name: 'This device',
      available: true
    }

Remote targets are returned by node-mp3stream.

Persist the selected target as a JSMusicDB setting, for example:

    playbackTarget

Default to:

    browser:local

If the saved remote target is unavailable on application startup, use the local
browser target and surface the remote target as unavailable rather than silently
trying to control a nonexistent renderer.

Do not delete the stored target just because it is temporarily offline.

## PlaybackController

Introduce `src/playback/PlaybackController.ts`.

Do not immediately move every player responsibility into it.

Use an incremental refactoring.

The controller should initially own:

- selected PlaybackTarget
- target switching
- load/play/pause/stop/seek delegation
- normalized playback state
- processing remote playback events

The existing `<lit-player>` continues to own playlist navigation during this
phase.

Once PlaybackTarget is stable, `_next()`, `_previous()` and playlist progression
can be extracted from the component into PlaybackController in a later change.

Avoid performing both refactorings in one change.

## Integration with player.ts

Refactor `src/components/player/player.ts` so `_play()` no longer directly
assumes an HTMLAudioElement.

Conceptually:

    _play()
      |
      +-- determine track using existing playlist logic
      |
      +-- active PlaybackTarget.load(track)
      |
      +-- target state/events update existing JSMusicDB state

Keep:

    _selectTrack()
    _previous()
    _next()
    _shuffleCollection()

functionally unchanged for the initial implementation.

For browser playback, behaviour should remain indistinguishable from the
current implementation.

For remote playback, `_play()` sends the track to RemotePlaybackTarget.

## Track loading request

For remote playback send the library resource, not the existing `/listen` URL.

Example:

    {
      "source": {
        "type": "library",
        "path": track.source.url
      },
      "metadata": {
        "id": track.id,
        "title": track.title,
        "artist": track.trackArtist,
        "album": track.album.name,
        "durationMs": track.duration,
        "mimeType": "...",
        "sampleRate": track.samplerate,
        "bitsPerSample": track.bits_per_sample,
        "channels": track.channels
      },
      "autoplay": true,
      "positionMs": 0
    }

Do not construct an authenticated `/listen?...&jwt=...` URL for a renderer.

The JWT must never be exposed to a DLNA device.

node-mp3stream is responsible for creating a temporary renderer-safe media URL.

## SSE

Continue using the existing `/stream` connection.

Extend `src/playback/remote/PlaybackEvents.ts` to consume named SSE events:

    playback.target-added
    playback.target-updated
    playback.target-removed

    playback.state
    playback.position
    playback.volume
    playback.ended
    playback.error

Existing scan-progress events should continue working.

Do not open a second EventSource solely for playback if the existing stream is
connected.

Refactor the existing SSE setup sufficiently to allow multiple consumers or an
event dispatcher.

## SSE playback event envelope

Expect:

    {
      "eventId": "8472",
      "timestamp": "2026-11-23T09:55:43.381Z",
      "targetId": "dlna:uuid:abc123",
      "data": {}
    }

Use the SSE event name to determine the event type.

## playback.state

Example:

    event: playback.state

    {
      "eventId": "8472",
      "timestamp": "...",
      "targetId": "dlna:uuid:abc123",
      "data": {
        "transport": "playing",
        "mediaId": "c69f5811",
        "positionMs": 127532,
        "durationMs": 256000
      }
    }

Translate this into the existing track state where necessary:

    playing:
      track.isPlaying = true
      track.isPaused = false

    paused:
      track.isPlaying = false
      track.isPaused = true

    stopped/idle:
      track.isPlaying = false
      track.isPaused = false

Continue emitting `UPDATE_PLAYER` and `UPDATE_TRACK` while legacy consumers rely
on those events.

Do not force all existing components to migrate to a new state mechanism as
part of DLNA support.

## playback.position

Remote position values are always milliseconds.

Example:

    {
      "targetId": "dlna:uuid:abc123",
      "data": {
        "positionMs": 129104,
        "durationMs": 256000
      }
    }

Update:

    track.position

and emit the existing player update.

The server should normally send at most approximately one position event per
second.

For smooth UI progress, interpolate the displayed position locally while the
remote target is playing.

Do not require sub-second network updates from the renderer.

## playback.ended

This is an important ownership boundary.

When receiving:

    playback.ended

verify that:

    targetId == active target
    mediaId == currently loaded media

Then invoke the existing next-track path.

The renderer must not decide what JSMusicDB plays next.

This preserves:

- playlist index behaviour
- shuffle
- continuous play
- dynamically generated playlists

## Scrobbling

Keep Last.fm and ListenBrainz in JSMusicDB.

For browser playback, preserve current behaviour.

For remote playback, trigger "now playing" only when observed target state
becomes `playing`.

Scrobbling must use observed playback position, not merely the successful return
of a `play` command.

Retain the existing rules:

- scrobble after the existing duration threshold
- prevent duplicate scrobbles using the existing state

Review the current `timePlayed` logic while touching this code. Do not change
scrobble policy unless necessary for remote playback.

## ReplayGain

Browser replay gain currently changes HTMLAudioElement.volume.

That behaviour remains available only for BrowserPlaybackTarget in the initial
DLNA implementation.

Do not apply the calculated JSMusicDB ReplayGain by changing the DLNA renderer's
device volume. Device volume is not equivalent to ReplayGain.

Remote ReplayGain should therefore initially be reported as unsupported/not
applied.

A future implementation can use transcoding or renderer-specific gain support.

## Visualizer

AudioMotionAnalyzer only applies to local BrowserPlaybackTarget because it
requires a browser audio source.

When a remote target is active:

- do not attempt to attach AudioMotionAnalyzer to remote audio
- hide or disable the real-time audio visualizer
- keep now-playing artwork and metadata available

Do not synthesize fake spectrum data.

## Media Session

Media Session controls remain active in the PWA.

Their callbacks should call PlaybackController rather than directly controlling
the HTMLAudioElement.

This allows:

    mediaSession play
      -> active target.play()

    mediaSession pause
      -> active target.pause()

    nexttrack
      -> existing JSMusicDB next logic

    previoustrack
      -> existing JSMusicDB previous logic

Keep MediaMetadata population in JSMusicDB because it describes the active
JSMusicDB track regardless of playback destination.

## Target UI

Add a playback-target selector to the player UI.

Minimum UX:

    Playing on:
      This device
      Living Room
      foobar2000
      ...

The browser target is always first.

Show unavailable known targets as unavailable rather than making them disappear
immediately if practical.

Do not implement DLNA MediaServer browsing in the target selector.

## Target switching

Initial target switching behaviour:

1. Capture current track and observed position.
2. Remember whether playback is currently playing or paused.
3. Stop the old target.
4. Select the new target.
5. Load the same JSMusicDB track.
6. Seek to approximately the previous position.
7. Resume only if the old target was playing.

Do not promise sample-accurate handover.

A small position difference for network renderers is acceptable.

If switching to a remote target fails, report the error and leave the user in a
well-defined stopped/paused state.

Do not silently initiate local playback as an error fallback.

## API errors

Support the backend error format:

    {
      "error": {
        "code": "SEEK_NOT_SUPPORTED",
        "message": "The selected renderer does not support seeking.",
        "targetId": "dlna:uuid:abc123"
      }
    }

Recognized codes:

    TARGET_NOT_FOUND
    TARGET_UNAVAILABLE
    UNSUPPORTED_OPERATION
    UNSUPPORTED_MEDIA
    MEDIA_NOT_FOUND
    MEDIA_NOT_REACHABLE
    INVALID_POSITION
    UPNP_ERROR
    COMMAND_TIMEOUT
    AUTHENTICATION_REQUIRED
    INTERNAL_ERROR

Surface meaningful playback errors in the UI.

Do not silently fall back to browser playback.

## Service worker

Ensure new control endpoints and SSE are not cached.

At minimum exclude:

    /api/playback/**
    /stream

Renderer media resources must also not be stored in the PWA cache.

The renderer itself retrieves those resources directly from node-mp3stream.

## Capability/version detection

Add a minimum node-mp3stream version for remote playback support after the
backend version containing the API has been decided.

Do not infer playback API support exclusively from the current SSE minimum
version.

If practical, prefer explicit capability discovery in a future API version,
but version checking is acceptable for this iteration because JSMusicDB already
uses this pattern.

## Implementation order

### Phase 1: browser abstraction

1. Add PlaybackTarget types.
2. Add BrowserPlaybackTarget.
3. Preserve existing local playback behaviour.
4. Route play/pause/seek through the abstraction.
5. Verify:
   - AudioContext sample-rate creation
   - ReplayGain
   - visualizer
   - Media Session
   - playlists
   - shuffle
   - scrobbling

No DLNA code should be required to complete this phase.

### Phase 2: remote API client

1. Add PlaybackApi.
2. Add target discovery/listing.
3. Add selected-target persistence.
4. Add RemotePlaybackTarget.
5. Add target UI.

### Phase 3: remote events

1. Extend SSE consumption for named events.
2. Process playback state.
3. Process position.
4. Process ended.
5. Process errors.
6. Keep existing EventBus consumers operational.

### Phase 4: handover and UX

1. Implement browser-to-DLNA switch.
2. Implement DLNA-to-browser switch.
3. Handle renderer disappearance.
4. Handle unsupported operations.
5. Disable local visualizer while remote.

## Acceptance criteria

Browser playback must continue to support all current features.

A user can discover and select a DLNA MediaRenderer exposed by
node-mp3stream.

Selecting a remote renderer does not transfer playlist ownership to
node-mp3stream.

Starting an album or playlist uses the existing JSMusicDB playlist.

Next/previous and shuffle continue to be decided by JSMusicDB.

A DLNA renderer never receives the JSMusicDB JWT.

Remote playback supports at minimum:

- load
- play
- pause where supported
- stop
- seek where supported
- state reporting
- position reporting
- end detection

The UI reflects actual renderer state rather than assuming a successful HTTP
command means audio is playing.

Last.fm and ListenBrainz scrobbling work for both browser and remote playback.

The current browser AudioContext/sample-rate solution continues to function.

No DLNA MediaServer browsing is included in this implementation.
