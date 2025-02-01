import { doc, onSnapshot } from 'firebase/firestore'
import { create } from 'zustand'
import { db } from './firebase'

export const useUserStore = create((set, get) => ({
	currentUser: null,
	isLoading: true,
	unsubscribe: null,

	fetchUserInfo: (uid) => {
		if (!uid) return set({ currentUser: null, isLoading: false })

		if (get().unsubscribe) {
			get().unsubscribe()
		}

		try {
			const docRef = doc(db, 'users', uid)

			const unsubscribe = onSnapshot(docRef, (docSnap) => {
				if (docSnap.exists()) {
					set({
						currentUser: { ...docSnap.data(), id: docSnap.id },
						isLoading: false,
					})
				} else {
					set({ currentUser: null, isLoading: false })
				}
			})

			set({ unsubscribe })
		} catch (error) {
			console.log(error)
			set({ currentUser: null, isLoading: false })
		}
	},

	clearUser: () => {
		if (get().unsubscribe) get().unsubscribe()
		set({ currentUser: null, isLoading: false, unsubscribe: null })
	},
}))
