import { useCallback, useRef, useState } from 'react';
import { useQrScanner } from '../hooks/useQrScanner';

export type DecodeOutcome = 'ok' | 'dup' | 'warn';

interface Props {
  locked: boolean;
  onDecode: (raw: string) => DecodeOutcome;
}

export function ScannerPanel({ locked, onDecode }: Props) {
  const [flashState, setFlashState] = useState<'on' | 'bad' | null>(null);
  const flashTimeout = useRef<number | null>(null);

  const handleDecode = useCallback(
    (raw: string) => {
      const outcome = onDecode(raw);
      setFlashState(outcome === 'ok' ? 'on' : 'bad');
      if (flashTimeout.current) window.clearTimeout(flashTimeout.current);
      flashTimeout.current = window.setTimeout(() => setFlashState(null), 160);
      if (navigator.vibrate) navigator.vibrate(outcome === 'ok' ? 40 : 120);
    },
    [onDecode]
  );

  const { videoRef, scanning, error, start, stop, torchOn, torchSupported, toggleTorch } = useQrScanner(handleDecode);

  let statusText = 'Lock a session above to begin scanning';
  if (locked) {
    if (error) statusText = error;
    else statusText = scanning ? 'Scanning… point camera at ID' : 'Camera off — tap "Start camera" to scan';
  }

  return (
    <div className="scan-panel">
      <div className="video-wrap">
        <video ref={videoRef} playsInline muted />
        {scanning && <div className="reticle" />}
        <div className={`scan-flash ${flashState === 'on' ? 'on' : ''} ${flashState === 'bad' ? 'on bad' : ''}`} />
        {scanning && torchSupported && (
          <button className={`torch-btn ${torchOn ? 'on' : ''}`} onClick={toggleTorch}>
            {torchOn ? 'Torch on' : 'Torch'}
          </button>
        )}
      </div>
      <div className="scan-status">{statusText}</div>
      <div className="scan-toggle">
        <button disabled={!locked || scanning} onClick={start}>
          Start camera
        </button>
        <button className="stop" disabled={!scanning} onClick={stop}>
          Stop camera
        </button>
      </div>
    </div>
  );
}
