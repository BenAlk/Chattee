import { useEffect, useState } from 'react'

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(
		window.matchMedia('(max-width: 650px)').matches
	)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 650px)')
		const handler = (e) => setIsMobile(e.matches)

		mediaQuery.addEventListener('change', handler)
		return () => mediaQuery.removeEventListener('change', handler)
	}, [])

	return isMobile
}
