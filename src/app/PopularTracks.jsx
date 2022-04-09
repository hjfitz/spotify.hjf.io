import React from 'react'
import Container from './ItemContainer'

const Track = ({name, albumName, onClick, albumReleaseDate, src, artists}) => (
	<Container onClick={onClick} src={src}>
		<div className="inline">
			<span className="block">{name} by {artists.map(a => a.name).join(', ')}</span>
			<span className="block">{albumName} ({albumReleaseDate})</span>
		</div>
	</Container>
)
const PopularTracks = ({tracks, playTrack}) => (
	<ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
		{tracks.map(track => {
			const {length, [length - 1]: {url}} = track.album.images
			const onClick = () => playTrack(track.url)
			return (
				<Track
					name={track.name}
					key={track.id}
					albumName={track.album_name}
					onClick={onClick}
					albumReleaseDate={track.album.release_date}
					src={url}
					artists={track.artists}
				/>
			)
		})}
	</ol>
)

export default PopularTracks
