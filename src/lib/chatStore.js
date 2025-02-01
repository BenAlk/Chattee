import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { db } from './firebase'
import { useUserStore } from './userStore'

export const useChatStore = create((set, get) => ({
	chatId: null,
	user: null,
	messages: [],
	chatList: [],
	isCurrentUserBlocked: false,
	isReceiverBlocked: false,
	detailVisible: false,
	listVisible: true,
	userUnsubscribe: null,
	chatUnsubscribe: null,
	chatListUnsubscribe: null,

	initializeChatList: () => {
		const currentUser = useUserStore.getState().currentUser
		if (!currentUser?.id) return

		if (get().chatListUnsubscribe) {
			get().chatListUnsubscribe()
		}

		const unsubscribe = onSnapshot(
			doc(db, 'userchats', currentUser.id),
			async (docSnapshot) => {
				try {
					if (!docSnapshot.exists()) {
						set({ chatList: [] })
						return
					}

					const data = docSnapshot.data()
					const rawChats = data?.chats || []

					const chatPromises = rawChats.map(async (item) => {
						try {
							const userDoc = await getDoc(doc(db, 'users', item.receiverId))
							return { ...item, user: userDoc.data() }
						} catch (error) {
							console.error('Error fetching user:', error)
							return null
						}
					})

					const chatData = (await Promise.all(chatPromises)).filter(Boolean)
					const sortedChats = chatData.sort((a, b) => b.updatedAt - a.updatedAt)
					set({ chatList: sortedChats })
				} catch (error) {
					console.error('Chat list listener error:', error)
					set({ chatList: [] })
				}
			}
		)

		set({ chatListUnsubscribe: unsubscribe })
	},

	selectChat: async (chat) => {
		const currentUser = useUserStore.getState().currentUser
		const state = get()

		try {
			const userChats = state.chatList.map((item) => {
				const { user, ...rest } = item
				return rest
			})

			const chatIndex = userChats.findIndex(
				(item) => item.chatId === chat.chatId
			)
			userChats[chatIndex].isSeen = true

			const userChatsRef = doc(db, 'userchats', currentUser.id)
			await updateDoc(userChatsRef, {
				chats: userChats,
			})

			state.changeChat(chat.chatId, chat.user)
		} catch (error) {
			console.error('Error selecting chat:', error)
		}
	},

	changeChat: (chatId, initialUserData) => {
		const currentUser = useUserStore.getState().currentUser

		if (get().userUnsubscribe) {
			get().userUnsubscribe()
		}
		if (get().chatUnsubscribe) {
			get().chatUnsubscribe()
		}

		if (initialUserData.blocked.includes(currentUser.id)) {
			set({
				chatId,
				user: null,
				messages: [],
				isCurrentUserBlocked: true,
				isReceiverBlocked: false,
				userUnsubscribe: null,
				chatUnsubscribe: null,
			})
			return
		}

		if (currentUser.blocked.includes(initialUserData.id)) {
			set({
				chatId,
				user: initialUserData,
				messages: [],
				isCurrentUserBlocked: false,
				isReceiverBlocked: true,
				userUnsubscribe: null,
				chatUnsubscribe: null,
			})
			return
		}

		try {
			const userUnsubscribe = onSnapshot(
				doc(db, 'users', initialUserData.id),
				(docSnap) => {
					if (docSnap.exists()) {
						const userData = { ...docSnap.data(), id: docSnap.id }
						set((state) => ({
							...state,
							user: userData,
						}))
					}
				}
			)

			const chatUnsubscribe = onSnapshot(
				doc(db, 'chats', chatId),
				(docSnap) => {
					if (docSnap.exists()) {
						const data = docSnap.data()
						if (data?.messages) {
							const sortedMessages = [...data.messages].sort(
								(a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
							)
							set((state) => ({
								...state,
								messages: sortedMessages,
							}))
						}
					}
				}
			)

			set({
				chatId,
				user: initialUserData,
				messages: [],
				isCurrentUserBlocked: false,
				isReceiverBlocked: false,
				userUnsubscribe,
				chatUnsubscribe,
			})
		} catch (error) {
			console.error(error)
		}
	},

	cleanup: () => {
		const state = get()
		if (state.userUnsubscribe) state.userUnsubscribe()
		if (state.chatUnsubscribe) state.chatUnsubscribe()
		if (state.chatListUnsubscribe) state.chatListUnsubscribe()

		set({
			chatId: null,
			user: null,
			messages: [],
			chatList: [],
			isCurrentUserBlocked: false,
			isReceiverBlocked: false,
			detailVisible: false,
			listVisible: true,
			userUnsubscribe: null,
			chatUnsubscribe: null,
			chatListUnsubscribe: null,
		})
	},

	changeBlock: () => {
		set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
	},
	toggleDetail: () => {
		set((state) => ({ ...state, detailVisible: !state.detailVisible }))
	},
	toggleList: () => {
		set((state) => ({ ...state, listVisible: !state.listVisible }))
	},
}))
