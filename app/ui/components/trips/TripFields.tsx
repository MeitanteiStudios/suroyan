
export type TripFieldsProps = {
    trip: any | null;
};

export default function TripFields({ trip }: TripFieldsProps) {
    return (
        <div className="w-full flex flex-col gap-4">
            <input type="hidden" name="trip_id" defaultValue={trip?.id ?? ''} />
            <div>
                <label htmlFor="tripName" className="block font-medium text-gray-300">
                    Trip Name
                </label>
                <input
                    type="text"
                    name="trip_name"
                    id="tripName"
                    defaultValue={trip?.name ?? ''}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-2">
                <div className="w-1/2">
                    <label htmlFor="startDate" className="block font-medium text-gray-300">
                        Arrival Date
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        id="startDate"
                        defaultValue={trip?.start_date ?? ''}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="w-1/2">
                    <label htmlFor="startTime" className="block font-medium text-gray-300">
                        Time
                    </label>
                    <input
                        type="time"
                        name="start_time"
                        id="startTime"
                        defaultValue={trip?.start_time ?? ''}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <div className="w-1/2">
                    <label htmlFor="endDate" className="block font-medium text-gray-300">
                        Departure Date
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        id="endDate"
                        defaultValue={trip?.end_date ?? ''}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="w-1/2">
                    <label htmlFor="endTime" className="block font-medium text-gray-300">
                        Time
                    </label>
                    <input
                        type="time"
                        name="end_time"
                        id="endTime"
                        defaultValue={trip?.end_time ?? ''}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}