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

export function makeSpotifyRequest(endpoint, token, method = 'GET', body = {}) {
	const url = `https://api.spotify.com/v1${endpoint}`
	const requestInit = {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	if (method !== 'GET') {
		requestInit.headers['content-type'] = 'application/json'
		requestInit.body = JSON.stringify(body)
	}

	console.log({requestInit})

	return fetch(url, requestInit).then(r => r.json())
}


