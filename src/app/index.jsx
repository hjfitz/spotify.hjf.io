import React, {useEffect, useState} from 'react'
import {render} from 'react-dom'

import PopularTracks from './PopularTracks'
import PopularArtists from './PopularArtists'
import {loginUrl, makeSpotifyRequest} from './spotify'

const entry = document.getElementById('react')

const App = () => {

	// get our token response, check if it's valid
	const resp = JSON.parse(localStorage.getItem('tokenResponse'))
	const expires = resp?.expires
	const isValid = new Date(expires) > new Date()
	// if so, init state
	const tokenState = isValid ? resp : null
	if (!isValid) localStorage.clear()
	const [token, setToken] = useState(tokenState)

	const [data, setData] = useState(null)
	// todo: handle
	const [error, setError] = useState(null)
	const [playing, setPlaying] = useState(null)


	const termLookup = {'short_term': '4 weeks', 'long_term': 'several years'}
	const terms = Object.keys(termLookup)
	const [term, setCurrentTerm] = useState(terms[0])
	const [type, setCurentType] = useState('artists')

	const setType = type => () => setCurentType(type)
	const setTerm = term => () => setCurrentTerm(term)

	useEffect(() => {
		const {hash} = window.location
		if (!hash) return 

		const response = hash.substring(1).split('&').reduce((acc, cur) => {
			const [key, val] = cur.split('=')
			if (!(key in acc)) acc[key] = val
			return acc
		}, {})


		if ('error' in response) {
			console.log('there was an error!')
			setError(response.error)
			return
		}

		if (!('access_token' in response)) {
			setError('No access token found!')
			return
		}

		const now = new Date()
		now.setSeconds(now.getSeconds() + parseInt(response.expires_in, 10))
		response.expires = now.toString()

		localStorage.setItem('tokenResponse', JSON.stringify(response))

		setToken(response)
		// todo: remove window hash
		history.pushState("", document.title, window.location.pathname)

	}, [])

	async function getUserData() {
		const {access_token} = token
		const self = await makeSpotifyRequest('/me', access_token)
		const types = ['tracks', 'artists']
			
		const data = await Promise.all(types.map(async type => {
			const resp = await Promise.all(terms.map(async term => {
				return {
					term,
					data: await makeSpotifyRequest(`/me/top/${type}?limit=10&time_range=${term}`, access_token) } 
			})) 

			const topData = resp.reduce((acc, cur) => {
				acc[cur.term] = cur.data
				return acc
			}, {})
			return {type, data: topData}
		}))

		const topMusic = data.reduce((acc, cur) => {
			acc[cur.type] = cur.data
			return acc
		}, {})
				
		setData({self, top: topMusic})
	}

	async function fetchNowplaying() {
		try {
			const playingResp = await makeSpotifyRequest(`/me/player/currently-playing`, token.access_token) 
			const {images} = playingResp.item.album
			const {length, [length - 1]: cover} = images
			setPlaying({
				track: playingResp.item.name,
				artist: playingResp.item.artists.map(a => a.name).join(', '),
				album: playingResp.item.album.name,
				art: cover.url,
			})
		} catch (err) {
			console.info('unable to parse nowplaying data. err:', err)
		}
	}

	function playTrack(uri) {
		return makeSpotifyRequest('/me/player/play', token.access_token, 'PUT', {uris: [uri]})
	}

	function playArtist(uri) {
		return makeSpotifyRequest('/me/player/play', token.access_token, 'PUT', {context_uri: uri})
	}

	useEffect(() => {
		if (!token || data) return
		getUserData()
		fetchNowplaying()
		setInterval(fetchNowplaying, 10e3)
	}, [token])
	if (!token) {
		window.location.href = loginUrl
		return ''
	}
	if (!data) return <div>Loading data</div>
	return (
		<main className="container mx-auto">
			<header className="flex flex-row flex-wrap">
				<span className="mr-4"><strong className="font-semibold">User:</strong> {data.self.display_name} ({data.self.id})</span>
				<span className="mr-4"><strong className="font-semibold">Expires on:</strong> {token.expires}</span>
				{playing 
					? (
						<span className="mr-4">
							<strong className="font-semibold">Now Playing: </strong>
							{playing.artist} - {playing.track} ({playing.album})
							<img className="inline h-6 max-h-full ml-2" src={playing.art} alt="now playing" />
						</span>
					)
					: (
						<span className="mr-4">
							<strong className="font-semibold">Now Playing: </strong> [No data]
						</span>
					)
				}
			</header>
			<section>
				<header>
					<h1>Your Popular Music</h1>
					<span>Showing all {term.replace('_', ' ')} favourite {type}</span>
				</header>

				<div className="flex justify-around mt-4">
					<div>
						<h2 className="text-center">Type</h2>
						<button 
							className={`selection-button ${type === 'artists' && 'active'}`} 
							onClick={setType('artists')}
						>
							Artists
						</button>
						<button 
							className={`selection-button ${type === 'tracks' && 'active'}`} 
							onClick={setType('tracks')}
						>
							Tracks
						</button>
					</div>
					<div>
						<h2 className="text-center">Term</h2>
						{Object.entries(termLookup).map(([termL, desc]) => (
							<button 
								className={`selection-button ${term === termL && 'active'}`} 
								key={termL} 
								onClick={setTerm(termL)}
							>
								{termL.replace('_', ' ')} ({desc})
							</button>
						))}
					</div>
				</div>
				<div className="ml-8">
					{type === 'artists' 
						? <PopularArtists playArtist={playArtist} artists={data.top[type][term].items} />
						: <PopularTracks playTrack={playTrack} tracks={data.top[type][term].items} />
					}
				</div>
			</section>
		</main>
	)
}

render(<App />, entry)
