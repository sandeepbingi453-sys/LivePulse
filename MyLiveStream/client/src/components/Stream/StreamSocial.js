import React from 'react';
import StreamInteractions from './StreamInteractions';
import StreamChat from './StreamChat';

const StreamSocial = ({ streamId, username }) => {
  return (
    <div className="social-container" style={{ marginTop: '1.5rem' }}>
      <StreamInteractions streamId={streamId} username={username} />
      <StreamChat streamId={streamId} username={username} />
    </div>
  );
};

export default StreamSocial;
