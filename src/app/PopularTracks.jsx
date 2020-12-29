import React from 'react'

const PopularTracks = ({tracks, playTrack}) => (
	<ol>
		{tracks.map(track => {
			const {length, [length - 1]: {url}} = track.album.images
			return (
				<li 
					className="py-2 pr-2 cursor-pointer hover:text-gray-700 duration-300"
					key={track.uri} 
					onClick={() => playTrack(track.uri)}
				>
					<img className="inline h-6 mr-2" src={url} />
					{track.name} by	{track.artists.map(a => a.name).join(', ')}	 ({track.album.name} ({track.album.release_date}))
				</li>
			)
		})}
	</ol>
)

export default PopularTracks
