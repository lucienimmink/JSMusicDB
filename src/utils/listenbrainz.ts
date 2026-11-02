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

interface Track {
  artist: { name: string };
  title: string;
  album?: { name: string };
  trackMbid?: string;
}

interface ListenBrainzLookupResponse {
  recording_mbid?: string;
  recording_name?: string;
  artist_credit_name?: string;
  release_name?: string;
}

type ListenBrainzFeedback = -1 | 0 | 1;

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

async function lookupTrackMbid(
  track: Track,
  token: string,
): Promise<string | undefined> {
  const params = new URLSearchParams({
    artist_name: track.artist.name,
    recording_name: track.title,
  });

  if (track.album) {
    params.set('release_name', track.album.name);
  }

  const response = await fetch(
    `https://api.listenbrainz.org/1/metadata/lookup/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `ListenBrainz metadata lookup failed: ` +
        `${response.status} ${await response.text()}`,
    );
  }

  const metadata = (await response.json()) as ListenBrainzLookupResponse;

  return metadata.recording_mbid;
}

async function ensureTrackMbid(track: Track, token: string): Promise<string> {
  if (track.trackMbid) {
    return track.trackMbid;
  }

  const trackMbid = await lookupTrackMbid(track, token);

  if (!trackMbid) {
    throw new Error(
      `Could not resolve MusicBrainz recording for ` +
        `"${track.artist} - ${track.title}"`,
    );
  }

  track.trackMbid = trackMbid;

  return trackMbid;
}

export async function setRecordingFeedback(
  token: string,
  track: Track,
  score: ListenBrainzFeedback,
) {
  const trackMbid = await ensureTrackMbid(track, token);
  const response = await fetch(
    'https://api.listenbrainz.org/1/feedback/recording-feedback',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recording_msid: trackMbid,
        score,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `ListenBrainz feedback failed: ${response.status} ${await response.text()}`,
    );
  }
}
