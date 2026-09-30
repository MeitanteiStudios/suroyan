'use client';

import TooltipInitializer from '../ui/components/tooltip';

export default function Layout({ children }: { children: React.ReactNode }) {
  TooltipInitializer();
  
  return (
    <div className="bg-gray-900">
      {children}
    </div>
  );
}