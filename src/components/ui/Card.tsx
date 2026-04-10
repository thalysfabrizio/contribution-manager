interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden transition-colors duration-200 ${
        hover ? 'hover:border-primary/30 hover:bg-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
