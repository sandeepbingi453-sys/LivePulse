import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../../SocketContext';
import StreamSocial from './StreamSocial';

const Streamer = ({ username, onBack }) => {
  const socket = useSocket();
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionKey, setSessionKey] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const videoPreviewRef = useRef(null);
  const wsRef = useRef(null);

  const startStreaming = async () => {
    try {
      const newKey = Math.random().toString(36).substring(2, 12);
      setSessionKey(newKey);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 }, 
        audio: true 
      });
      console.log('✅ [Streamer] getUserMedia success');
      
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      
      const ws = new WebSocket(`ws://localhost:5001/stream?type=broadcaster&streamId=${newKey}`);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🟢 [Streamer] WebSocket Connected');
        
        const mimeType = 'video/webm; codecs="vp8, opus"';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn(`⚠️ [Streamer] ${mimeType} not supported, falling back to default`);
        }

        const recorder = new MediaRecorder(stream, { 
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
          videoBitsPerSecond: 1200000 
        });
        console.log(`🎥 [Streamer] Recorder started with mimeType: ${recorder.mimeType}`);
        
        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const buffer = await e.data.arrayBuffer();
            ws.send(buffer);
          }
        };
        
        recorder.start(200); // 200ms chunks for low latency
        setMediaRecorder(recorder);
        setIsStreaming(true);
        socket.emit('start-stream', newKey);
      };

      ws.onerror = (err) => console.error('WS Error:', err);
    } catch (err) {
      console.error('Streaming Error:', err);
      alert('Camera error: ' + err.message);
    }
  };

  const stopStreaming = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    socket.emit('stop-stream');
    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
      videoPreviewRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsStreaming(false);
    setSessionKey('');
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Stream Live</h2>
        <button className="btn-secondary" onClick={onBack}>Back to Menu</button>
      </div>
      
      <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative', aspectRatio: '16/9' }}>
        <video ref={videoPreviewRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {!isStreaming ? (
          <button className="btn-primary" onClick={startStreaming}>Start Broadcast</button>
        ) : (
          <button className="btn-primary" style={{ background: '#ff4757' }} onClick={stopStreaming}>Stop Broadcast</button>
        )}
        {isStreaming && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Stream Key:</p>
            <code style={{ background: '#eee', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{sessionKey}</code>
          </div>
        )}
      </div>

      {isStreaming && <StreamSocial streamId={sessionKey} username={username} />}
    </div>
  );
};

export default Streamer;
