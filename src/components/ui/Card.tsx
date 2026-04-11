interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm shadow-black/5 transition-all duration-200 ${
        hover ? 'hover:border-primary/30 hover:bg-card-hover hover:shadow-md hover:shadow-black/15' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
