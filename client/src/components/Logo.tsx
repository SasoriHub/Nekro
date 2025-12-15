import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent",
            sizeClasses[size]
          )}
          data-testid="logo-text"
        >
          NEKORA
        </span>
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-cyan/20 blur-lg -z-10" />
      </div>
    </div>
  );
}
