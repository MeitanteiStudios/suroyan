import { getTrips } from "@/lib/supabase/trips/actions";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function NavLinks() {
  const [trips, setTrips] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const tripId = searchParams.get('id') || '';

  const router = useRouter();
  
  useEffect(() => {
    const loadTrips = async () => {
      const data = await getTrips();
      setTrips(data);

      if (tripId.length == 0 && data.length > 0) {
        router.push(`/dashboard?id=${data[0].id}`);
      }
    }

    loadTrips();
  }, [tripId]);

  return (
    <>
      {trips.map((trip) => {
        return (
          <a
            key={trip.name}
            href={`/dashboard?id=${trip.id}`}
            className="flex h-[48px] items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 justify-start p-2 px-3"
          >
            <p className="block">{trip.name}</p>
          </a>
        );
      })}
    </>
  );
}
