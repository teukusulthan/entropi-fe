import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`surface-card overflow-hidden rounded-[24px] border border-[var(--border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`border-b border-[var(--border)] px-6 py-5 sm:px-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`px-6 py-5 sm:px-7 sm:py-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
