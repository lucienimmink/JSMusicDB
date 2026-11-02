const LISTENBRAINZ_API_URL = 'https://api.listenbrainz.org/1/submit-listens';

export interface ListenBrainzTrack {
  artist: string;
  title: string;
  album?: string;
  durationMs?: number;
  recordingMbid?: string;
  releaseMbid?: string;
  artistMbids?: string[];
}

interface ListenBrainzAdditionalInfo {
  submission_client: string;
  submission_client_version?: string;
  duration_ms?: number;
  recording_mbid?: string;
  release_mbid?: string;
  artist_mbids?: string[];
}

interface ListenBrainzTrackMetadata {
  artist_name: string;
  track_name: string;
  release_name?: string;
  additional_info: ListenBrainzAdditionalInfo;
}

interface ListenBrainzPayloadItem {
  listened_at?: number;
  track_metadata: ListenBrainzTrackMetadata;
}

function createTrackMetadata(
  track: ListenBrainzTrack,
): ListenBrainzTrackMetadata {
  return {
    artist_name: track.artist,
    track_name: track.title,
    ...(track.album && {
      release_name: track.album,
    }),
    additional_info: {
      submission_client: 'JSMusicDB',
      ...(track.durationMs !== undefined && {
        duration_ms: track.durationMs,
      }),
      ...(track.recordingMbid && {
        recording_mbid: track.recordingMbid,
      }),
      ...(track.releaseMbid && {
        release_mbid: track.releaseMbid,
      }),
      ...(track.artistMbids?.length && {
        artist_mbids: track.artistMbids,
      }),
    },
  };
}

async function submit(
  token: string,
  listenType: 'playing_now' | 'single',
  payload: ListenBrainzPayloadItem[],
): Promise<void> {
  const response = await fetch(LISTENBRAINZ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listen_type: listenType,
      payload,
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `ListenBrainz request failed with status ${response.status}: ${message}`,
    );
  }
}

export async function announceListenBrainzNowPlaying(
  token: string,
  track: ListenBrainzTrack,
): Promise<void> {
  if (!token) {
    return;
  }

  await submit(token, 'playing_now', [
    {
      track_metadata: createTrackMetadata(track),
    },
  ]);
}

export async function scrobbleListenBrainzTrack(
  token: string,
  track: ListenBrainzTrack,
  startedAt: number,
): Promise<void> {
  if (!token) {
    return;
  }

  await submit(token, 'single', [
    {
      listened_at: Math.floor(startedAt / 1000),
      track_metadata: createTrackMetadata(track),
    },
  ]);
}
