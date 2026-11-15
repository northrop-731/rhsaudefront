
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div
      className="
        w-full
        rounded-xl
        border border-gray-200
        bg-white
        p-6
        shadow-sm
      "
    >
      {children}
    </div>
  );
}
