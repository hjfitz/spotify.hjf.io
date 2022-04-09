// todo - largely broken
import {useState} from 'react'
import {SpotifyApi} from "./spotify.api"

export function useUserData() {
	const [data, setData] = useState(null)

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
