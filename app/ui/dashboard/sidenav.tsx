'use client';

import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon, MapIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline';
import AddTrip from '../components/trips/AddTrip';

type SideNavProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideNav({
  isOpen,
  setIsOpen
}: SideNavProps) {

  return (
    <div className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col text-gray-600
    bg-white px-3 py-4 shadow-lg ${
        isOpen ? 'block' : 'hidden'
      }`}>
      <span
        className="mb-8 border-b-2 px-3 border-b-gray-50 flex items-center justify-between rounded-md"
      >
        <div className="w-32 text-blue-600 md:w-40">
          <span className="block md:hidden"><AcmeLogo  /></span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-1 hover:bg-sky-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </span>
      <div className="flex grow flex-col justify-between space-x-0 space-y-2">
        <span
            key="Home"
            className="h-[48px] items-center gap-2 rounded-md text-sm font-medium flex justify-start p-2 px-3"
          >
            <MapIcon className="w-6" />
            <p className="block text-lg">Recent Trips</p>
          </span>
        <NavLinks />
        <AddTrip />
        <div className="h-auto w-full grow rounded-md block"></div>
        <form>
          <button className="flex h-[48px] w-full grow items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 flex-none justify-start p-2 px-3">
            <PowerIcon className="w-6" />
            <div className="block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
