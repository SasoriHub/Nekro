import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  PictureInPicture2,
  FastForward,
  Rewind,
  Keyboard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HLSVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeNumber?: number;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  initialProgress?: number;
  openingStart?: number;
  openingEnd?: number;
  endingStart?: number;
  endingEnd?: number;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPreviousEpisode?: boolean;
}

interface QualityLevel {
  id: number;
  height: number;
  width: number;
  bitrate: number;
  label: string;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const keyboardShortcuts = [
  { key: "Space / K", action: "Воспроизведение / Пауза" },
  { key: "M", action: "Вкл/выкл звук" },
  { key: "F", action: "Полноэкранный режим" },
  { key: "←", action: "Назад 10 сек" },
  { key: "→", action: "Вперед 10 сек" },
  { key: "↑", action: "Громкость +" },
  { key: "↓", action: "Громкость -" },
  { key: "J", action: "Назад 10 сек" },
  { key: "L", action: "Вперед 10 сек" },
  { key: "0-9", action: "Перейти к % видео" },
];

export function HLSVideoPlayer({
  src,
  poster,
  title,
  episodeNumber,
  onEnded,
  onProgress,
  initialProgress = 0,
  openingStart,
  openingEnd,
  endingStart,
  endingEnd,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode,
  hasPreviousEpisode,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState(-1);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const [seekIndicator, setSeekIndicator] = useState<{ show: boolean; direction: "left" | "right"; seconds: number }>({
    show: false,
    direction: "left",
    seconds: 0,
  });
  const [brightnessIndicator, setBrightnessIndicator] = useState<{ show: boolean; value: number }>({
    show: false,
    value: 100,
  });
  const [volumeIndicator, setVolumeIndicator] = useState<{ show: boolean; value: number }>({
    show: false,
    value: 100,
  });

  const isHlsSource = useMemo(() => src.includes(".m3u8") || src.includes("playlist"), [src]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (isHlsSource && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        startLevel: -1,
        abrEwmaDefaultEstimate: 500000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, index) => ({
          id: index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          label: `${level.height}p`,
        }));
        setQualityLevels([{ id: -1, height: 0, width: 0, bitrate: 0, label: "Авто" }, ...levels]);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (quality === -1) {
          console.log(`Auto quality switched to level ${data.level}`);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting recovery");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting recovery");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal error, destroying HLS instance");
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }
  }, [src, isHlsSource]);

  const handleQualityChange = useCallback((levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setQuality(levelId);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((values: number[]) => {
    if (!videoRef.current) return;
    const newVolume = values[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((values: number[]) => {
    if (!videoRef.current) return;
    const newTime = values[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  }, []);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  const skipForward = useCallback((seconds: number = 10) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + seconds, duration);
    setSeekIndicator({ show: true, direction: "right", seconds });
    setTimeout(() => setSeekIndicator({ show: false, direction: "right", seconds: 0 }), 500);
  }, [duration]);

  const skipBackward = useCallback((seconds: number = 10) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - seconds, 0);
    setSeekIndicator({ show: true, direction: "left", seconds });
    setTimeout(() => setSeekIndicator({ show: false, direction: "left", seconds: 0 }), 500);
  }, []);

  const skipOpening = useCallback(() => {
    if (!videoRef.current || !openingEnd) return;
    videoRef.current.currentTime = openingEnd;
  }, [openingEnd]);

  const skipEnding = useCallback(() => {
    if (onNextEpisode && hasNextEpisode) {
      onNextEpisode();
    }
  }, [onNextEpisode, hasNextEpisode]);

  const seekToPercent = useCallback((percent: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = (percent / 100) * duration;
  }, [duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime);

      if (
        openingStart !== undefined &&
        openingEnd !== undefined &&
        video.currentTime >= openingStart &&
        video.currentTime <= openingEnd
      ) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }

      if (
        endingStart !== undefined &&
        endingEnd !== undefined &&
        video.currentTime >= endingStart
      ) {
        setShowSkipOutro(true);
      } else {
        setShowSkipOutro(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgress > 0) {
        video.currentTime = initialProgress;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [initialProgress, onProgress, onEnded, openingStart, openingEnd, endingStart, endingEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          skipBackward(10);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          skipForward(10);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
        case "?":
          setShowShortcutsOverlay(prev => !prev);
          break;
        case "escape":
          setShowShortcutsOverlay(false);
          break;
      }

      if (/^[0-9]$/.test(e.key)) {
        const percent = parseInt(e.key) * 10;
        seekToPercent(percent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skipBackward, skipForward, volume, handleVolumeChange, seekToPercent]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchStart = touchStartRef.current;
    if (!touchStart || !containerRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (touchX < rect.width / 3) {
          skipBackward(10);
        } else if (touchX > (rect.width * 2) / 3) {
          skipForward(10);
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
        if (doubleTapTimeoutRef.current) {
          clearTimeout(doubleTapTimeoutRef.current);
        }
        doubleTapTimeoutRef.current = setTimeout(() => {
          togglePlay();
        }, 300);
      }
    }

    touchStartRef.current = null;
  }, [skipBackward, skipForward, togglePlay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touchStart = touchStartRef.current;
    if (!touchStart || !containerRef.current || !videoRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touchStart.x - rect.left;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const seekTime = (deltaX / rect.width) * 60;
      setSeekIndicator({
        show: true,
        direction: seekTime > 0 ? "right" : "left",
        seconds: Math.abs(Math.round(seekTime)),
      });
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      const volumeChange = -deltaY / rect.height;
      
      if (touchX < rect.width / 2) {
        const newBrightness = Math.max(0, Math.min(100, 100 + volumeChange * 100));
        setBrightnessIndicator({ show: true, value: newBrightness });
      } else {
        const newVolume = Math.max(0, Math.min(1, volume + volumeChange));
        handleVolumeChange([newVolume]);
        setVolumeIndicator({ show: true, value: Math.round(newVolume * 100) });
      }
    }
  }, [volume, handleVolumeChange]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black touch-none select-none",
        isFullscreen && "rounded-none"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      data-testid="video-player"
    >
      <video
        ref={videoRef}
        poster={poster}
        className="h-full w-full"
        onClick={togglePlay}
        playsInline
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-purple border-t-transparent" />
        </div>
      )}

      {seekIndicator.show && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full text-white",
          seekIndicator.direction === "left" ? "left-1/4" : "right-1/4"
        )}>
          {seekIndicator.direction === "left" ? (
            <Rewind className="h-6 w-6" />
          ) : (
            <FastForward className="h-6 w-6" />
          )}
          <span className="text-lg font-medium">{seekIndicator.seconds}s</span>
        </div>
      )}

      {volumeIndicator.show && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-black/70 px-3 py-4 rounded-lg z-50">
          <Volume2 className="h-5 w-5 text-white" />
          <div className="h-24 w-1 bg-white/30 rounded-full relative overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-white rounded-full transition-all duration-150"
              style={{ height: `${volumeIndicator.value}%` }}
            />
          </div>
          <span className="text-white text-xs">{volumeIndicator.value}%</span>
        </div>
      )}

      {brightnessIndicator.show && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-black/70 px-3 py-4 rounded-lg z-50">
          <Maximize className="h-5 w-5 text-white" />
          <div className="h-24 w-1 bg-white/30 rounded-full relative overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-yellow-400 rounded-full transition-all duration-150"
              style={{ height: `${brightnessIndicator.value}%` }}
            />
          </div>
          <span className="text-white text-xs">{brightnessIndicator.value}%</span>
        </div>
      )}

      {showShortcutsOverlay && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Горячие клавиши
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcutsOverlay(false)}
                className="h-8 w-8 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-sm text-neon-purple font-mono">
                    {shortcut.key}
                  </kbd>
                  <span className="text-white/80 text-sm">{shortcut.action}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs mt-4 text-center">
              Нажмите ? для открытия/закрытия
            </p>
          </div>
        </div>
      )}

      {showSkipIntro && (
        <Button
          onClick={skipOpening}
          className="absolute bottom-24 right-4 bg-neon-purple/90 text-white hover:bg-neon-purple"
          data-testid="button-skip-intro"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Пропустить опенинг
        </Button>
      )}

      {showSkipOutro && hasNextEpisode && (
        <Button
          onClick={skipEnding}
          className="absolute bottom-24 right-4 bg-neon-purple/90 text-white hover:bg-neon-purple"
          data-testid="button-skip-outro"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Следующая серия
        </Button>
      )}

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex items-center gap-4">
          {hasPreviousEpisode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousEpisode}
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              data-testid="button-prev-episode"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipBackward(10)}
            className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            data-testid="button-rewind"
          >
            <Rewind className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-16 w-16 rounded-full bg-neon-purple/90 text-white hover:bg-neon-purple"
            data-testid="button-play-pause"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipForward(10)}
            className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            data-testid="button-forward"
          >
            <FastForward className="h-5 w-5" />
          </Button>

          {hasNextEpisode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextEpisode}
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              data-testid="button-next-episode"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-16 transition-opacity duration-200",
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {title && (
          <div className="mb-2 text-sm text-white/80">
            {episodeNumber && <span>Эпизод {episodeNumber} • </span>}
            {title}
          </div>
        )}

        <div
          ref={progressRef}
          className="group mb-3 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-2"
          onClick={handleProgressClick}
        >
          <div
            className="relative h-full rounded-full bg-neon-purple"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-9 w-9 text-white hover:bg-white/10"
              data-testid="button-play-pause-small"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-9 w-9 text-white hover:bg-white/10"
                data-testid="button-mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
                data-testid="slider-volume"
              />
            </div>

            <span className="text-sm text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcutsOverlay(true)}
              className="h-9 w-9 text-white hover:bg-white/10"
              data-testid="button-shortcuts"
            >
              <Keyboard className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-white hover:bg-white/10"
                  data-testid="button-speed"
                >
                  {playbackSpeed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Скорость</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {playbackSpeeds.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handlePlaybackSpeedChange(speed)}
                    className={cn(speed === playbackSpeed && "bg-secondary")}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {qualityLevels.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white hover:bg-white/10"
                    data-testid="button-quality"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Качество</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {qualityLevels.map((level) => (
                    <DropdownMenuItem
                      key={level.id}
                      onClick={() => handleQualityChange(level.id)}
                      className={cn(level.id === quality && "bg-secondary")}
                    >
                      {level.label}
                      {level.bitrate > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {Math.round(level.bitrate / 1000)}kbps
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePiP}
              className="h-9 w-9 text-white hover:bg-white/10"
              data-testid="button-pip"
            >
              <PictureInPicture2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-9 w-9 text-white hover:bg-white/10"
              data-testid="button-fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
