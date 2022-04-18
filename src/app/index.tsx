import * as React from 'react'
import {render} from 'react-dom'

import PopularTracks from './PopularTracks'
import PopularArtists from './PopularArtists'
import {loginUrl} from './spotify'
import {capitalise, titleify} from './util'
import useLogin from './useLogin'
import {SpotifyApi} from './spotify.api'

const entry = document.getElementById('react')

enum Term {
	Short = 'short_term',
	Medium = 'medium_term',
	Long = 'long_term',
}

enum Types {
	Tracks = 'tracks',
	Artists = 'artists',
}

const termLookup: Record<Term, string> = {
	[Term.Short]: '4 Weeks', 
	[Term.Medium]: 'Last 6 Months',
	[Term.Long]: 'All Time',
}


const terms = Object.values(Term)


//type TermsObj<T = null> =  Record<TermKey, T>
//function termsFactory(): TermsObj {
		
function termsFactory(): Record<Term, any> {
	return {
		[Term.Short]: {},
		[Term.Long]: {},
		[Term.Medium]: {},
	}
}

function typesFactory(): Record<Types, any> {
	return {
		[Types.Tracks]: {},
		[Types.Artists]: {},
	}
}


const App = () => {
	// get our token response, check if it's valid
	const [data, setData] = React.useState(null)
	const [newData, setNewData] = React.useState()
	const [playing, setPlaying] = React.useState(null)
	const [term, setCurrentTerm] = React.useState<Term>(Term.Short)
	const [type, setCurentType] = React.useState<Types>(Types.Tracks)

	const setType = (type: Types) => () => setCurentType(type)
	const setTerm = (term: Term) => () => setCurrentTerm(term)

	const {token} = useLogin()

	React.useEffect(() => {
		console.log({term, type})
	}, [term, type])



	async function getUserData() {
		// todo: types
		const self = await SpotifyApi.client.get('/me') 
		const types = Object.values(Types)
			
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
			}, termsFactory())
			return {type, data: topData}
		}))

		const topMusic = data.reduce((acc, cur) => {
			acc[cur.type] = cur.data
			return acc
		}, typesFactory())

				
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

	function playTrack(uri: string) {
		return SpotifyApi.client.put('/me/player/play', {uris: [uri]})
	}

	function playArtist(uri: string) {
		return SpotifyApi.client.put('/me/player/play', {context_uri: uri})
	}

	React.useEffect(() => {
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
					{type === Types.Artists
						? <PopularArtists playArtist={playArtist} artists={data.top[type][term].items} />
						: <PopularTracks playTrack={playTrack} tracks={data.top[type][term].items} />
					}
				</div>
			</section>
		</main>
	)
}

render(<App />, entry)
