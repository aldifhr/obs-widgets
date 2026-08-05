import type { RankDisplay, ValorantMmrResponse } from './types';

const HENRIK_BASE = 'https://api.henrikdev.xyz/valorant/v2/mmr';
const HENRIK_MATCHES = 'https://api.henrikdev.xyz/valorant/v3/matches';
const HENRIK_KEY = import.meta.env.VITE_HENRIK_KEY as string | undefined;

export type { RankDisplay } from './types';

export interface LastMatchResult {
  id: string;
  result: 'win' | 'lose' | 'tie';
}

function authHeaders(): Record<string, string> {
  return HENRIK_KEY ? { Authorization: HENRIK_KEY } : {};
}

export async function fetchLastMatch(
  name: string,
  tag: string,
  region: string,
): Promise<LastMatchResult | null> {
  const encodedName = encodeURIComponent(name.trim());
  const encodedTag = encodeURIComponent(tag.trim().replace('#', ''));
  const url = `${HENRIK_MATCHES}/${encodeURIComponent(region)}/${encodedName}/${encodedTag}?mode=competitive`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text().catch(() => '');
    throw new Error(`Henrik API error ${res.status}${text ? ': ' + text : ''}`);
  }

  const json = (await res.json()) as any;
  const match = json?.data?.[0];
  if (!match) return null;

  const teamKey = String(match.player?.team ?? '').toLowerCase();
  const team = match.teams?.[teamKey];
  const oppKey = teamKey === 'red' ? 'blue' : 'red';
  const opp = match.teams?.[oppKey];

  let result: LastMatchResult['result'] = 'lose';
  if (team?.has_won) result = 'win';
  else if (
    team && opp &&
    team.has_won === false && opp.has_won === false &&
    (team.rounds_won ?? 0) === (opp.rounds_won ?? 0)
  ) {
    result = 'tie';
  }

  return { id: String(match.metadata?.matchid ?? ''), result };
}

export async function fetchMmr(
  name: string,
  tag: string,
  region: string,
): Promise<RankDisplay> {
  const encodedName = encodeURIComponent(name.trim());
  const encodedTag = encodeURIComponent(tag.trim().replace('#', ''));
  const url = `${HENRIK_BASE}/${encodeURIComponent(region)}/${encodedName}/${encodedTag}`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Henrik API error ${res.status}${text ? ': ' + text : ''}`);
  }

  const json = (await res.json()) as ValorantMmrResponse;
  const current = json.data.current_data;

  return {
    tier: current.currenttierpatched,
    tierNumber: current.currenttier,
    rr: current.ranking_in_tier,
    images: current.images,
  };
}
