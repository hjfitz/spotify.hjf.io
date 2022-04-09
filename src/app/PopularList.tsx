import * as React from 'react'

interface PopularListProps {
	mapFn: (args: any) => JSX.Element[] // should map to props for el
	el: JSX.Element
	dataset: any[]
}

const PopularList = ({mapFn, el: Elem}) => {
	<ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

)
