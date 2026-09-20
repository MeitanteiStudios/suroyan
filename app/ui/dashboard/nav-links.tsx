import { getTrips } from "@/lib/supabase/trips/actions";
import { useEffect, useState } from "react";

export default function NavLinks() {
  const [trips, setTrips] = useState<any[]>([]);
  
  useEffect(() => {
    const loadTrips = async () => {
      const data = await getTrips();
      setTrips(data);
    }

    loadTrips();
  }, []);

  return (
    <>
      {trips.map((trip) => {
        return (
          <a
            key={trip.name}
            href={`/dashboard/${trip.id}`}
            className="flex h-[48px] items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 justify-start p-2 px-3"
          >
            <p className="block">{trip.name}</p>
          </a>
        );
      })}
    </>
  );
}
