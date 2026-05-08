import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../SocketContext';

const VideoPlayer = ({ streamId }) => {
  const socket = useSocket();
  const videoRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const queueRef = useRef([]);
  const hasInitializedRef = useRef(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`🎬 [Player] Mounting for: ${streamId}`);
    
    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    const drainQueue = () => {
      const sb = sourceBufferRef.current;
      if (sb && !sb.updating && queueRef.current.length > 0) {
        const chunk = queueRef.current.shift();
        try {
          sb.appendBuffer(chunk);
        } catch (e) {
          console.warn('⚠️ [Player] Buffer busy, re-queuing');
          queueRef.current.unshift(chunk);
        }
      }
    };

    const onSourceOpen = () => {
      console.log("📦 [Player] MediaSource open");
      const mimeType = 'video/webm; codecs="vp8, opus"';
      
      if (!MediaSource.isTypeSupported(mimeType)) {
        console.error(`❌ [Player] ${mimeType} is NOT supported by this browser.`);
        setError(`Browser does not support ${mimeType}`);
        return;
      }

      try {
        const sb = mediaSource.addSourceBuffer(mimeType);
        console.log("✅ [Player] SourceBuffer added successfully");
        sb.mode = 'sequence'; 
        sourceBufferRef.current = sb;
        sb.addEventListener('updateend', drainQueue);
        
        // Connect to Native WebSocket
        const ws = new WebSocket(`ws://localhost:5001/stream?type=viewer&streamId=${streamId}`);
        ws.binaryType = 'arraybuffer';
        
        ws.onmessage = (event) => {
          const data = event.data;
          const sb = sourceBufferRef.current;
          const ms = mediaSourceRef.current;

          if (!hasInitializedRef.current) {
            console.log(`🚀 [Player] First chunk received (${data.byteLength} bytes)`);
            hasInitializedRef.current = true;
            setIsWaiting(false);
          }

          if (sb && !sb.updating && ms && ms.readyState === 'open' && queueRef.current.length === 0) {
            try {
              sb.appendBuffer(data);
              if (videoRef.current && videoRef.current.paused) {
                videoRef.current.play().catch(err => {
                  console.warn("⚠️ [Player] Autoplay blocked or failed:", err);
                });
              }
            } catch (e) {
              queueRef.current.push(data);
            }
          } else {
            queueRef.current.push(data);
          }
        };

        ws.onclose = () => console.log('👤 [WS] Viewer WS closed');
        ws.onerror = (err) => console.error('❌ [WS] Viewer WS Error:', err);
      } catch (e) {
        console.error("❌ [Player] Buffer initialization failed:", e);
        setError("Buffer initialization failed.");
      }
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);
    if (videoRef.current) videoRef.current.src = URL.createObjectURL(mediaSource);

    socket.emit('join-stream', streamId);
    socket.on('viewer-count', (count) => setViewers(count));
    socket.on('stream-ended', () => setError("Stream has ended."));

    // Aggressive Latency Catch-up (Target: 1s)
    const monitor = setInterval(() => {
      const v = videoRef.current;
      if (v && v.buffered.length > 0) {
        const lastBuffered = v.buffered.end(v.buffered.length - 1);
        const latency = lastBuffered - v.currentTime;
        
        if (latency > 1.5) {
          console.log(`⚡ [Latency] Catching up... (${latency.toFixed(2)}s)`);
          v.currentTime = lastBuffered - 0.5; // Jump to near-live
        } else if (latency > 1.0) {
          v.playbackRate = 1.1; // Slight speed up
        } else {
          v.playbackRate = 1.0;
        }
      }
    }, 1000);

    return () => {
      clearInterval(monitor);
      socket.emit('leave-stream', streamId);
      socket.off('viewer-count');
      socket.off('stream-ended');
      if (mediaSource.readyState === 'open') {
        try { mediaSource.endOfStream(); } catch(e) {}
      }
      if (videoRef.current) videoRef.current.src = '';
      sourceBufferRef.current = null;
      mediaSourceRef.current = null;
      queueRef.current = [];
    };
  }, [socket, streamId]); 

  const handleManualSync = () => window.location.reload();

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
        {isWaiting && !error && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
            <div className="loader" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem' }}>WAITING FOR STREAM...</p>
            <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={handleManualSync}>Force Sync</button>
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', background: 'rgba(255,71,87,0.4)', zIndex: 11 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold' }}>{error}</p>
              <button className="btn-secondary" onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          </div>
        )}

        <video ref={videoRef} muted playsInline controls style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <span style={{ color: '#ff4757', fontWeight: 'bold' }}>● {viewers} VIEWERS</span>
      </div>
      <style>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
    </div>
  );
};

export default VideoPlayer;
