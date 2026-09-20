'use server';

type RequestParams = Record<
    string,
    string | number | boolean | null | undefined
>;

async function apiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'Suroyan/1.0',
            ...options?.headers,
        },
    });

    const contentType = response.headers.get('content-type') ?? '';

    const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof data === 'string'
                ? data
                : data?.message || `Request failed: ${response.status}`;

        throw new Error(message);
    }

    return data as T;
}

export async function get<T>(
    url: string,
    params?: RequestParams
): Promise<T> {
    const query = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            query.append(key, String(value));
        }
    });

    return apiRequest<T>(
        `${url}${query.toString() ? `?${query.toString()}` : ''}`
    );
}

export async function post<T>(
    url: string,
    data?: Record<string, any>
): Promise<T> {
    return apiRequest<T>(url, {
        method: 'POST',
        body: JSON.stringify(data ?? {}),
    });
}