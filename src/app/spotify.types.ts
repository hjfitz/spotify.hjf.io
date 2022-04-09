// warning: mostly generated types
//
export interface SpotifyResponse<T> {
	href: string
	items: T[]
	limit: number
	next: string
	offset: number
	previous: string
	total: number
}

// --- Track response

export interface Track {
    album:             Album;
    artists:           ArtistMeta[];
    available_markets: string[];
    disc_number:       number;
    duration_ms:       number;
    explicit:          boolean;
    external_ids:      ExternalIDS;
    external_urls:     ExternalUrls;
    href:              string;
    id:                string;
    is_local:          boolean;
    name:              string;
    popularity:        number;
    preview_url:       string;
    track_number:      number;
    type:              string;
    uri:               string;
}

export interface Album {
    album_type:             string;
    artists:                Artist[];
    available_markets:      string[];
    external_urls:          ExternalUrls;
    href:                   string;
    id:                     string;
    images:                 Image[];
    name:                   string;
    release_date:           Date;
    release_date_precision: string;
    total_tracks:           number;
    type:                   string;
    uri:                    string;
}

export interface ArtistMeta {
    external_urls: ExternalUrls;
    href:          string;
    id:            string;
    name:          string;
    type:          string;
    uri:           string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface Image {
    height: number;
    url:    string;
    width:  number;
}

export interface ExternalIDS {
    isrc: string;
}

// ----- Artist response

export interface Artist {
    external_urls: ExternalUrls;
    followers:     Followers;
    genres:        string[];
    href:          string;
    id:            string;
    images:        Image[];
    name:          string;
    popularity:    number;
    type:          string;
    uri:           string;
}

export interface Followers {
    href:  null;
    total: number;
}

export interface Image {
    height: number;
    url:    string;
    width:  number;
}


export type ArtistResponse = SpotifyResponse<Artist>
export type TrackResponse = SpotifyResponse<Track>
