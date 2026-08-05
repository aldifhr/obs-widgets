export type WidgetEvent = 'rankup' | 'derank' | 'up' | 'down' | 'win' | 'lose' | 'tie';

export interface WidgetState {
  tierNumber: number;
  rr: number;
  lastMatchId: string | null;
}

const EVENT_LABELS: Record<WidgetEvent, string> = {
  rankup: 'RANK UP',
  derank: 'DERANK',
  up: 'RR UP',
  down: 'RR DOWN',
  win: 'WIN',
  lose: 'LOSS',
  tie: 'TIED',
};

export function getStateKey(name: string, tag: string, region: string): string {
  return `valorant-rank-widget:state:${region}:${name.toLowerCase()}#${tag.toLowerCase()}`;
}

export function readState(key: string): WidgetState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as WidgetState;
  } catch {
    return null;
  }
}

export function writeState(key: string, state: WidgetState) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore (private mode etc.)
  }
}

export function detectEvents(
  prev: WidgetState | null,
  data: { tierNumber: number; rr: number },
  lastMatch: { id: string; result: 'win' | 'lose' | 'tie' } | null,
): WidgetEvent[] {
  const isNewMatch = !!lastMatch && !!lastMatch.id && lastMatch.id !== prev?.lastMatchId;
  const tierUp = prev ? data.tierNumber > prev.tierNumber : false;
  const tierDown = prev ? data.tierNumber < prev.tierNumber : false;

  if (isNewMatch) {
    if (lastMatch.result === 'win') return tierUp ? ['rankup'] : ['win'];
    if (lastMatch.result === 'lose') return tierDown ? ['derank'] : ['lose'];
    return ['tie'];
  }

  if (prev) {
    if (tierUp) return ['rankup'];
    if (tierDown) return ['derank'];
    if (data.rr !== prev.rr) return [data.rr > prev.rr ? 'up' : 'down'];
  }

  return [];
}

export function playEventAnimation(container: HTMLElement, event: WidgetEvent, detail = '') {
  removeEventOverlay();
  const overlay = document.createElement('div');
  overlay.className = `event-overlay event-${event}`;
  const detailHtml = detail ? `<div class="event-detail">${detail}</div>` : '';
  overlay.innerHTML = `<div class="event-body"><div class="event-title">${EVENT_LABELS[event]}</div>${detailHtml}</div>`;

  const isWidgetPage = document.body.classList.contains('widget-page');
  if (isWidgetPage) {
    document.body.appendChild(overlay);
  } else {
    overlay.classList.add('event-box');
    container.appendChild(overlay);
  }

  setTimeout(() => overlay.remove(), 3500);
}

export function removeEventOverlay() {
  document.querySelectorAll('.event-overlay').forEach((el) => el.remove());
}

export function playEvents(container: HTMLElement, events: WidgetEvent[]) {
  events.forEach((event, i) => {
    setTimeout(() => playEventAnimation(container, event), i * 500);
  });
}

let audioCtx: AudioContext | null = null;

function beep(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.2) {
  const ctx = audioCtx!;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

export function playEventSound(event: WidgetEvent) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx ?? new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    switch (event) {
      case 'rankup':
        beep(523.25, 0, 0.18, 'triangle', 0.25);
        beep(659.25, 0.16, 0.18, 'triangle', 0.25);
        beep(783.99, 0.32, 0.3, 'triangle', 0.25);
        break;
      case 'derank':
        beep(392, 0, 0.2, 'sawtooth', 0.18);
        beep(311.13, 0.18, 0.2, 'sawtooth', 0.18);
        beep(261.63, 0.36, 0.35, 'sawtooth', 0.18);
        break;
      case 'win':
        beep(523.25, 0, 0.15, 'triangle', 0.25);
        beep(783.99, 0.15, 0.3, 'triangle', 0.25);
        break;
      case 'lose':
        beep(392, 0, 0.18, 'sawtooth', 0.18);
        beep(329.63, 0.18, 0.3, 'sawtooth', 0.18);
        break;
      case 'tie':
        beep(440, 0, 0.2, 'triangle', 0.2);
        beep(440, 0.22, 0.2, 'triangle', 0.2);
        break;
      case 'up':
        beep(659.25, 0, 0.25, 'triangle', 0.22);
        break;
      case 'down':
        beep(329.63, 0, 0.25, 'sawtooth', 0.15);
        break;
    }
  } catch {
    // ignore audio errors
  }
}
