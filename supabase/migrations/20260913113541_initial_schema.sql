-- Trips
create table public.trips (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    start_date date not null,
    start_time time,
    end_date date not null,
    end_time time,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- Accommodations
create table public.accommodations (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    name text not null,
    google_place_id text,
    address text,
    latitude double precision,
    longitude double precision,
    check_in date,
    check_out date,
    created_at timestamptz not null default now()
);


-- Places to visit
create table public.trip_places (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    name text not null,
    google_place_id text,
    address text,
    latitude double precision,
    longitude double precision,
    category text,
    day integer not null default 0,
    sort_order integer not null default 0,
    distance integer not null default 0,
    created_at timestamptz not null default now()
);