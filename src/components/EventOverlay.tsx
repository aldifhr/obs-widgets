import type { WidgetEvent } from '../shared/animations';

const EVENT_LABELS: Record<WidgetEvent, string> = {
  rankup: 'RANK UP',
  derank: 'DERANK',
  up: 'RR UP',
  down: 'RR DOWN',
  win: 'WIN',
  lose: 'LOSS',
  tie: 'TIED',
};

interface EventOverlayProps {
  event: WidgetEvent;
  detail?: string;
}

export default function EventOverlay({ event, detail }: EventOverlayProps) {
  return (
    <div className={`event-overlay event-${event}`}>
      <div className="event-body">
        <div className="event-title">{EVENT_LABELS[event]}</div>
        {detail && <div className="event-detail">{detail}</div>}
      </div>
    </div>
  );
}
