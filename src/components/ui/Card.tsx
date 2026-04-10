interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
