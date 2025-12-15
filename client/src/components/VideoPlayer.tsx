import { useState, useRef, useEffect, useCallback } from "react";
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

interface VideoPlayerProps {
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

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const qualityOptions = ["Auto", "1080p", "720p", "480p", "360p"];

export function VideoPlayer({
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
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 10,
      duration
    );
  }, [duration]);

  const skipBackward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - 10,
      0
    );
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
          skipBackward();
          break;
        case "arrowright":
          skipForward();
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skipBackward, skipForward, volume, handleVolumeChange]);

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
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        isFullscreen && "rounded-none"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      data-testid="video-player"
    >
      <video
        ref={videoRef}
        src={src}
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
            onClick={skipBackward}
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
            onClick={skipForward}
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
                    className={cn(
                      speed === playbackSpeed && "bg-secondary"
                    )}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10"
                  data-testid="button-settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Качество</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {qualityOptions.map((q) => (
                  <DropdownMenuItem
                    key={q}
                    onClick={() => setQuality(q)}
                    className={cn(q === quality && "bg-secondary")}
                  >
                    {q}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
