import React from 'react'

const PopularArtists = ({artists, playArtist}) => (
	<ol>
		{artists.map(artist => {
			const {length, [length - 1]: art} = artist.images
			const {url: src} = art
			const onClick = () => playArtist(artist.uri)
			return (
				<li
					onClick={onClick}
					className="py-2 pr-2 cursor-pointer hover:text-gray-700 duration-300" 
					key={artist.id}
				>
					<img className="inline h-6 mr-2" src={src} />{artist.name}
				</li>
			)
		})}
	</ol>
)

export default PopularArtists
