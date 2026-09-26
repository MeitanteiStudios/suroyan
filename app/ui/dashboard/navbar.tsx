import { Bars3Icon } from "@heroicons/react/24/outline";
import AcmeLogo from "../acme-logo";

type SideNavProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavBar({
  isOpen,
  setIsOpen,
}: SideNavProps) {
  return (
    <div className="flex justify-between items-center px-3 py-2 md:px-7">
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-md p-1 hover:bg-gray-500`}
                >
                <Bars3Icon className="h-6 w-6" />
            </button>
        </div>
        <AcmeLogo />
        <div className="flex justify-end gap-4">
            <div className="flex-col items-end justify-center gap-1 text-sm text-gray-200 hidden md:flex">
                <p>John Smith</p>
                <p>johnsmith@email.com</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-200">
            </div>
        </div>
    </div>
  );
}