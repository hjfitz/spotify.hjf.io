import React, {useState, useEffect} from 'react'

export default function useLogin() {
	console.log('oi')

	const resp = JSON.parse(localStorage.getItem('tokenResponse'))
	let isValid = false
	if (resp && resp.expires) {
		const expires = resp.expires
		isValid = new Date(expires) > new Date()
	}

	const tokenState = isValid ? resp : null

	if (!isValid) localStorage.clear()

	const [token, setToken] = useState(tokenState)
	const [error, setError] = useState(null)
	console.log('initialised state')

	useEffect(() => {
		console.log('useEffect..?')
		const {hash} = window.location
		console.log(hash)
		if (!hash) return 

		const response = hash.substring(1).split('&').reduce((acc, cur) => {
			const [key, val] = cur.split('=')
			if (!(key in acc)) acc[key] = val
			return acc
		}, {})


		if ('error' in response) {
			console.log('there was an error!')
			setError(response.error)
			return
		}

		if (!('access_token' in response)) {
			setError('No access token found!')
			return
		}

		const now = new Date()
		now.setSeconds(now.getSeconds() + parseInt(response.expires_in, 10))
		response.expires = now.toString()

		localStorage.setItem('tokenResponse', JSON.stringify(response))

		setToken(response)
		// todo: remove window hash
		history.pushState("", document.title, window.location.pathname)
		return {token, error, setError}
	}, [])

}

