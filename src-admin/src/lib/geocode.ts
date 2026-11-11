/**
 * The search for an address: mapbox with the token of the adapter - the same geocoder that the adapter computed the
 * routes with up to now - and Photon (komoot, data of OpenStreetMap) without one.
 */

/** One hit of the search */
export interface Suggestion {
    address: string;
    /** Longitude, latitude */
    coordinates: [number, number];
}

interface MapboxResponse {
    features?: { place_name?: string; center?: [number, number]; geometry?: { coordinates?: [number, number] } }[];
    message?: string;
}

interface PhotonResponse {
    features?: {
        geometry?: { coordinates?: [number, number] };
        properties?: {
            name?: string;
            street?: string;
            housenumber?: string;
            postcode?: string;
            city?: string;
            district?: string;
            state?: string;
            country?: string;
        };
    }[];
}

/** The languages Photon knows; it answers in the local language for the others */
const PHOTON_LANGUAGES = ['de', 'en', 'fr', 'it'];

/**
 * Searches an address
 *
 * @param query what the user typed
 * @param token the token of mapbox, empty for Photon
 * @param lang the language of the ioBroker system
 * @param signal aborts the request when the user typed on
 */
export async function searchAddress(
    query: string,
    token: string | undefined,
    lang: string,
    signal: AbortSignal,
): Promise<Suggestion[]> {
    if (token) {
        const params = new URLSearchParams({
            access_token: token,
            autocomplete: 'true',
            limit: '6',
            language: lang === 'zh-cn' ? 'zh' : lang,
            types: 'address,poi,place,locality,neighborhood,postcode',
        });
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
            { signal },
        );
        const body = (await response.json()) as MapboxResponse;
        if (!response.ok) {
            throw new Error(body.message || response.statusText);
        }
        return (body.features || [])
            .map(feature => ({
                address: feature.place_name || '',
                coordinates: (feature.geometry?.coordinates || feature.center) as [number, number],
            }))
            .filter(suggestion => suggestion.address && Array.isArray(suggestion.coordinates));
    }

    const params = new URLSearchParams({ q: query, limit: '6' });
    if (PHOTON_LANGUAGES.includes(lang)) {
        params.set('lang', lang);
    }
    const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal });
    if (!response.ok) {
        throw new Error(response.statusText || String(response.status));
    }
    const body = (await response.json()) as PhotonResponse;
    return (body.features || [])
        .map(feature => {
            const p = feature.properties || {};
            const street = p.street ? [p.street, p.housenumber].filter(Boolean).join(' ') : '';
            const place = [p.postcode, p.city || p.district].filter(Boolean).join(' ');
            const parts = [p.name !== p.street ? p.name : '', street, place, p.country].filter(Boolean);
            return {
                address: [...new Set(parts)].join(', '),
                coordinates: feature.geometry?.coordinates as [number, number],
            };
        })
        .filter(suggestion => suggestion.address && Array.isArray(suggestion.coordinates));
}
