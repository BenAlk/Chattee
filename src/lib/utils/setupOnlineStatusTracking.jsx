import { onDisconnect, onValue, ref, set } from 'firebase/database'
import { auth, realtimeDb } from '../firebase.js'

export const setupOnlineStatusTracking = (userId, onStatusChange) => {
	const userStatusRef = ref(realtimeDb, `/status/${userId}`)
	const connectedRef = ref(realtimeDb, '.info/connected')

	if (userId === auth.currentUser?.uid) {
		const connectedCallback = onValue(connectedRef, (snap) => {
			if (snap.val() === true) {

				set(userStatusRef, {
					status: 'online',
					lastSeen: new Date().toISOString(),
				})

				onDisconnect(userStatusRef).set({
					status: 'offline',
					lastSeen: new Date().toISOString(),
				})
			}
		})


		return () => {
			connectedCallback()
			set(userStatusRef, {
				status: 'offline',
				lastSeen: new Date().toISOString(),
			})
		}
	}

	const statusCallback = onValue(userStatusRef, (snapshot) => {
		if (snapshot.exists()) {
			const data = snapshot.val()
			onStatusChange(userId, data.status === 'online')
		} else {
			onStatusChange(userId, false)
		}
	})


	return () => {
		statusCallback()
	}
}

export default setupOnlineStatusTracking
