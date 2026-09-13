export default function TripFields() {
    return (
        <div className="w-full flex flex-col gap-4">
            <div>
                <label htmlFor="tripName" className="block font-medium text-gray-700">
                    Trip Name
                </label>
                <input
                    type="text"
                    name="trip_name"
                    id="tripName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <div className="flex gap-2">
                <div className="w-1/2">
                    <label htmlFor="tripName" className="block font-medium text-gray-700">
                        Arrival Date
                    </label>
                    <input
                        type="date"
                        name="arrival_date"
                        id="arrivalDate"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="tripName" className="block font-medium text-gray-700">
                        Time
                    </label>
                    <input
                        type="time"
                        name="arrival_time"
                        id="arrivalTime"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="w-1/2">
                    <label htmlFor="tripName" className="block font-medium text-gray-700">
                        Departure Date
                    </label>
                    <input
                        type="date"
                        name="departure_date"
                        id="departureDate"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="tripName" className="block font-medium text-gray-700">
                        Time
                    </label>
                    <input
                        type="time"
                        name="departure_time"
                        id="departureTime"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};