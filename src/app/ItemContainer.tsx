import * as React from 'react'

interface ContainerProps {
	onClick?: (p?: any) => void
	src: string
	children: JSX.Element
}

const Container = ({onClick, src, children}: ContainerProps) => (
	<li
		onClick={onClick}
		className="pr-2 flex items-center cursor-pointer hover:text-gray-700 duration-300 h-24 bg-gray-800 bg-opacity-40" 
	>
		<img className="inline h-full mr-4 w-24" src={src} />
		{children}
	</li>
)

export default Container
