import React, { useEffect, useRef } from 'react';

const YouTubeBackgroundAudio = ({ isMuted, volume = 45 }) => {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    // Load YouTube IFrame API if not already injected
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const createPlayer = () => {
      if (playerRef.current) return;
      try {
        playerRef.current = new window.YT.Player('youtube-ambient-player', {
          height: '1',
          width: '1',
          videoId: 'wTZZNpuZYTI',
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: 'wTZZNpuZYTI', // Required for looping single video on YouTube
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              isReadyRef.current = true;
              event.target.setVolume(volume);
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              // Loop back when ended
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            }
          }
        });
      } catch {
        // ignore initialization errors
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };
    }

    // Auto-resume audio on first user gesture if browser blocked unmuted autoplay
    const handleFirstGesture = () => {
      if (playerRef.current && isReadyRef.current && !isMuted) {
        try {
          playerRef.current.unMute();
          playerRef.current.playVideo();
        } catch {
          // ignore
        }
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Update mute/play state whenever isMuted prop changes
  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.mute();
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.unMute();
        playerRef.current.playVideo();
      }
    } catch {
      // ignore
    }
  }, [isMuted]);

  return (
    <div 
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
        opacity: 0.001,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -1
      }}
    >
      <div id="youtube-ambient-player"></div>
    </div>
  );
};

export default YouTubeBackgroundAudio;
