import * as React from 'react'
import Container from './ItemContainer'

interface ArtistProps {
	name: string
	src: string
	onClick: () => void
}

const Artist = ({name, src, onClick}: ArtistProps) => (
	<Container onClick={onClick} src={src}>
		<p className="inline text-lg">{name}</p>
	</Container>
)

const PopularArtists = ({artists, playArtist}) => (
	<ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
		{artists.map((artist) => {
			const {length, [length - 1]: art} = artist.images
			const {url: src} = art
			const onClick = () => playArtist(artist.uri)
			return (
				<Artist
					name={artist.name}
					src={src}
					onClick={onClick}
				/>
			)
		})}
	</ol>
)

export default PopularArtists
