'use client';
import { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinimize2, FiMonitor } from 'react-icons/fi';

interface Quality { label: string; url: string; }
interface Props {
  src: string;
  qualities?: Quality[];
  subtitles?: { label: string; src: string; srclang: string }[];
  movieId?: string;
  partySocket?: any;
  isPartyHost?: boolean;
  onTimeUpdate?: (t: number) => void;
  seekTo?: number;
  syncPlaying?: boolean;
}

export default function VideoPlayer({
  src, qualities, subtitles, movieId, partySocket, isPartyHost, onTimeUpdate, seekTo, syncPlaying
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [theater, setTheater] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let player: any;
    const init = async () => {
      const Plyr = (await import('plyr')).default;
      if (!videoRef.current) return;
      player = new Plyr(videoRef.current, {
        controls: ['play-large','play','progress','current-time','mute','volume','captions','settings','pip','fullscreen'],
        settings: ['quality','speed','loop'],
        speed: { selected: 1, options: [0.5,0.75,1,1.25,1.5,2] },
        tooltips: { controls: true, seek: true },
        keyboard: { focused: true, global: true },
        captions: { active: true, language: 'auto', update: true },
      });
      playerRef.current = player;
      setPlayerReady(true);

      if (movieId) {
        fetch('/api/analytics', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId }),
        }).catch(() => {});
      }

      // Save progress to localStorage
      if (movieId) {
        const saved = localStorage.getItem(`nova_progress_${movieId}`);
        if (saved) {
          const t = parseFloat(saved);
          player.once('ready', () => { if (t > 10) player.currentTime = t; });
        }
        player.on('timeupdate', () => {
          if (player.currentTime > 5) {
            localStorage.setItem(`nova_progress_${movieId}`, String(Math.floor(player.currentTime)));
          }
          onTimeUpdate?.(player.currentTime);
        });
      }

      // Watch Party sync
      if (partySocket) {
        if (isPartyHost) {
          player.on('play', () => partySocket.emit('party:play', { time: player.currentTime }));
          player.on('pause', () => partySocket.emit('party:pause', { time: player.currentTime }));
          player.on('seeked', () => partySocket.emit('party:seek', { time: player.currentTime }));
        }
        partySocket.on('party:play', ({ time }: any) => { player.currentTime = time; player.play(); });
        partySocket.on('party:pause', ({ time }: any) => { player.currentTime = time; player.pause(); });
        partySocket.on('party:seek', ({ time }: any) => { player.currentTime = time; });
      }
    };

    init();
    return () => { player?.destroy(); };
  }, [src]);

  useEffect(() => {
    if (seekTo !== undefined && playerRef.current) playerRef.current.currentTime = seekTo;
  }, [seekTo]);

  const allQualities = qualities?.length ? qualities : [{ label: '1080p', url: src }];

  return (
    <div ref={containerRef} className={`relative w-full rounded-xl overflow-hidden bg-black transition-all duration-500 ${theater ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Quality selector */}
      {allQualities.length > 1 && (
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          {allQualities.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentQuality(i);
                if (playerRef.current) {
                  const t = playerRef.current.currentTime;
                  playerRef.current.source = { type: 'video', sources: [{ src: q.url }] };
                  playerRef.current.currentTime = t;
                }
              }}
              className={`px-2 py-0.5 text-xs rounded font-semibold transition-all ${
                i === currentQuality ? 'bg-nova-accent text-white' : 'bg-black/60 text-nova-muted hover:bg-black/80'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
      {/* Theater toggle */}
      <button
        onClick={() => setTheater(!theater)}
        className="absolute top-3 left-3 z-30 p-1.5 bg-black/60 rounded-lg text-nova-muted hover:text-white transition-colors"
      >
        {theater ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
      </button>
      {theater && (
        <button onClick={() => setTheater(false)}
          className="absolute top-3 left-12 z-30 px-3 py-1 bg-nova-accent text-white text-xs rounded-lg flex items-center gap-1.5">
          <FiMonitor size={12} /> Theater Mode
        </button>
      )}
      <video ref={videoRef} className="w-full" crossOrigin="anonymous" playsInline>
        <source src={allQualities[currentQuality]?.url || src} type="video/mp4" />
        {subtitles?.map((s, i) => (
          <track key={i} kind="subtitles" label={s.label} src={s.src} srcLang={s.srclang} />
        ))}
      </video>
    </div>
  );
}
