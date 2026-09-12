'use client';

import { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import NavBar from '../ui/dashboard/navbar';
import TooltipInitializer from '../ui/components/tooltip';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  TooltipInitializer();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden text-gray-600">
      {/* Sidebar overlays everything */}
      <SideNav isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Navbar + Main */}
      <div className="flex h-full w-full flex-col">
        <NavBar isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="grow overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}