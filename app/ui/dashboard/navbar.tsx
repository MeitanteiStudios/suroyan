import { Bars3Icon } from "@heroicons/react/24/outline";
import AcmeLogo from "../acme-logo";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SideNavProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavBar({
  isOpen,
  setIsOpen,
}: SideNavProps) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? '');
    };

    getUser();
  }, []);
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
            <div className="flex-col items-center justify-center gap-1 text-sm text-gray-200 hidden md:flex">
                <p>{ email }</p>
            </div>
            {/* <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-200">
            </div> */}
        </div>
    </div>
  );
}