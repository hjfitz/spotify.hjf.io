
const clientID = process.env.SPOTIFY_CLIENT_ID
const redirectURI = process.env.SPOTIFY_REDIRECT_URI
const scopesRaw = process.env.SPOTIFY_SCOPES

const scopes = encodeURIComponent((scopesRaw || "").trim().split(';').map(scope => scope.trim()).join(' '))


// todo: add a state and validate
export const loginUrl = 'https://accounts.spotify.com/authorize'
	+ `?client_id=${clientID}`
	+ `&response_type=token`
	+ `&redirect_uri=${redirectURI}`
	+ `&scope=${scopes}`

export class SpotifyApi {
	private static instance: SpotifyApi
	private constructor(private readonly token: string) {}
	private readonly apiUrl = `https://api.spotify.com/v1`

	public static initialise(token: string) {
		this.instance = new SpotifyApi(token)
	}

	public static get client() {
		if (!SpotifyApi.instance) {
			throw new Error("Unable to initialise client");
		}

		return SpotifyApi.instance
	}

	private getUrl(endpoint: string): string {
		return this.apiUrl + endpoint
	}

	private makeSpotifyRequest<T>(endpoint: string, method = 'GET', body = {}): Promise<T> {
		const url = this.getUrl(endpoint)
		const authHeader = `Bearer ${this.token}`

		const requestInit: RequestInit = {
			method,
			headers: {
				Authorization: authHeader
			},
		}

		if (method !== 'GET') {
			requestInit.headers['content-type'] = 'application/json'
			requestInit.body = JSON.stringify(body)
		}

		return fetch(url, requestInit).then(r => r.json()) as Promise<T>
	}

	public get<T>(endpoint: string) {
		return this.makeSpotifyRequest<T>(endpoint)
	}

	public put<T>(endpoint: string, body = {}) {
		return this.makeSpotifyRequest<T>(endpoint, 'PUT', body)
	}

	public patch<T>(endpoint: string, body = {}) {
		return this.makeSpotifyRequest<T>(endpoint, 'PATCH', body)
	}

	public delete<T>(endpoint: string, body = {}) {
		return this.makeSpotifyRequest<T>(endpoint, 'DELETE', body)
	}
}

