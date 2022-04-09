import React, {useEffect, useState} from 'react'
import {render} from 'react-dom'

import PopularTracks from './PopularTracks'
import PopularArtists from './PopularArtists'
import {loginUrl, makeSpotifyRequest} from './spotify'
import {capitalise, titleify} from './util'
import useLogin from './useLogin'
import {SpotifyApi} from './spotify.api'

// useLogin:
// if we have a valid token, great
// if not, redirect to login and do the flow
// end goal: initialise the SpotifyApi singleton
// meantime: return the token for use

const entry = document.getElementById('react')

const termLookup = {
	'short_term': '4 Weeks', 
	'medium_term': 'Last 6 Months',
	'long_term': 'All Time',
}

const terms = Object.keys(termLookup)

const App = () => {
	// get our token response, check if it's valid
	const [data, setData] = useState(null)
	const [playing, setPlaying] = useState(null)
	const [term, setCurrentTerm] = useState(terms[0])
	const [type, setCurentType] = useState('tracks')

	const setType = type => () => setCurentType(type)
	const setTerm = term => () => setCurrentTerm(term)

	const {token} = useLogin()

	async function getUserData() {
		const self = await SpotifyApi.client.get('/me') // makeSpotifyRequest('/me', access_token)
		const types = ['tracks', 'artists']
			
		const data = await Promise.all(types.map(async type => {
			const resp = await Promise.all(terms.map(async term => {
				return {
					term,
					data: await SpotifyApi.client.get(`/me/top/${type}?limit=10&time_range=${term}`)
				} 
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
			const playingResp = await SpotifyApi.client.get(`/me/player/currently-playing`)
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
		return SpotifyApi.client.put('/me/player/play', {uris: [uri]})
	}

	function playArtist(uri) {
		return SpotifyApi.client.put('/me/player/play', {context_uri: uri})
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
		<main className="container px-4 mx-auto">
			<header className="flex flex-row flex-wrap pt-2">
				<span className="mr-4"><strong className="font-semibold">User:</strong> {data.self.display_name} ({data.self.id})</span>

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

				<div className="flex flex-col justify-between my-4 md:flex-row">
					<div>
						<h2 className="py-2 text-lg text-center">Type</h2>
						<div className="flex flex-wrap items-center justify-center">
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
					</div>
					<div>
						<h2 className="py-2 text-lg text-center">Term</h2>
						<div className="flex flex-wrap items-center justify-center">
							{Object.entries(termLookup).map(([termL, desc]) => (
								<button 
									className={`selection-button ${term === termL && 'active'}`} 
									key={termL} 
									onClick={setTerm(termL)}
								>
									{titleify(termL)} ({desc})
								</button>
							))}
						</div>
					</div>
				</div>
					

				<div className="">
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
