interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-border/60 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}
