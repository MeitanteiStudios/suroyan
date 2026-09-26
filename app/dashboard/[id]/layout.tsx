'use client';

import { useEffect, useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import NavBar from '../../ui/dashboard/navbar';
import TooltipInitializer from '../../ui/components/tooltip';

export default function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }>; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tripId, setTripId] = useState('');
  TooltipInitializer();

  useEffect(() => {

    const loadTrip = async () => {
      const { id } = await params;
      setTripId(id);
    };

    loadTrip();
  }, [tripId]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden text-gray-200 bg-gray-900">
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