import React from 'react'

const PopularTracks = ({tracks, playTrack}) => (
	<ol>
		{tracks.map(track => {
			const {length, [length - 1]: {url}} = track.album.images
			return (
				<li 
					className="flex flex-col items-center py-2 pr-2 cursor-pointer md:flex-row md:items-start hover:text-gray-700 duration-300"
					key={track.uri} 
					onClick={() => playTrack(track.uri)}
				>
					<div className="mr-2 h-18">
						<img className="track-img" src={url} />
					</div>
					<div>
						<span className="block">{track.name} by	{track.artists.map(a => a.name).join(', ')}</span>
						<span className="block">({track.album.name} ({track.album.release_date}))</span>
					</div>
				</li>
			)
		})}
	</ol>
)

export default PopularTracks
