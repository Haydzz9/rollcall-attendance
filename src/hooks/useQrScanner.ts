import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  switch (name) {
    case 'NotAllowedError':
      return 'Camera permission denied — check Site settings → Camera in your browser and allow it.';
    case 'NotFoundError':
      return 'No camera found on this device.';
    case 'NotReadableError':
      return 'Camera is busy — close other apps/tabs using it and retry.';
    case 'OverconstrainedError':
      return 'Camera does not support the requested settings.';
    case 'SecurityError':
      return 'Camera blocked — this page must be loaded over HTTPS.';
    default:
      return 'Camera access denied or unavailable.';
  }
}

async function getCameraStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 720 } }
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError')) {
      return await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    }
    throw err;
  }
}

const DEBOUNCE_MS = 2500;

export function useQrScanner(onDecode: (raw: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastCodeRef = useRef<{ value: string; time: number } | null>(null);

  // tick's own requestAnimationFrame(tick) call below re-invokes the exact closure it was
  // created with, not whichever closure the latest render produced — so if onDecode were
  // called directly, the running scan loop would keep calling the *original* onDecode
  // (and its stale view of session records) for as long as scanning continues, letting the
  // same ID be re-recorded instead of caught as a duplicate. Routing through a ref that's
  // updated every render keeps tick itself stable while always calling the latest handler.
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.readyState === video.HAVE_ENOUGH_DATA) {
      if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            const now = Date.now();
            const last = lastCodeRef.current;
            if (!last || last.value !== code.data || now - last.time > DEBOUNCE_MS) {
              lastCodeRef.current = { value: code.data, time: now };
              onDecodeRef.current(code.data);
            }
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API unavailable — open this link in Chrome or Safari directly.');
      return;
    }
    try {
      const stream = await getCameraStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setTorchSupported(Boolean(capabilities?.torch));
      setScanning(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(cameraErrorMessage(err));
    }
  }, [tick]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      // torch toggle unsupported on this device; ignore
    }
  }, [torchOn]);

  useEffect(() => stop, [stop]);

  return { videoRef, scanning, error, start, stop, torchOn, torchSupported, toggleTorch };
}
