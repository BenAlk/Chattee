import { useEffect, useState } from 'react'

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(() => {
		const userAgent = navigator.userAgent || navigator.vendor || window.opera
		const isTouchDevice =
			'ontouchstart' in window || navigator.maxTouchPoints > 0
		const isNarrow = window.matchMedia('(max-width: 768px)').matches

		return (
			/android|iphone|ipad|ipod|windows phone/i.test(userAgent) ||
			isTouchDevice ||
			isNarrow
		)
	})

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)')
		const handler = (e) =>
			setIsMobile(
				(prev) =>
					/android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent) ||
					'ontouchstart' in window ||
					e.matches
			)

		mediaQuery.addEventListener('change', handler)
		return () => mediaQuery.removeEventListener('change', handler)
	}, [])

	return isMobile
}
