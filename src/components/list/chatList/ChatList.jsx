import { ref, set } from 'firebase/database'
import { Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useIsMobile } from '../../../components/hooks/useIsMobile'
import { useChatStore } from '../../../lib/chatStore'
import { auth, realtimeDb } from '../../../lib/firebase'
import { useUserStore } from '../../../lib/userStore'
import { setupOnlineStatusTracking } from '../../../lib/utils/setupOnlineStatusTracking'
import { AddUser } from './addUser/AddUser'
import './chatList.css'

export const ChatList = () => {
	const [addMode, setAddMode] = useState(false)
	const [search, setSearch] = useState('')
	const [onlineStatuses, setOnlineStatuses] = useState({})
	const isMobile = useIsMobile()

	const { currentUser, clearUser } = useUserStore()
	const { chatList, chatId, initializeChatList, selectChat, toggleList } =
		useChatStore()

	useEffect(() => {
		initializeChatList()
	}, [currentUser?.id])

	useEffect(() => {
		if (!chatList.length || !currentUser) return
		const cleanupFunctions = []

		const currentUserStatusRef = ref(realtimeDb, `/status/${currentUser.id}`)
		set(currentUserStatusRef, {
			status: 'online',
			lastSeen: new Date().toISOString(),
		})

		const initialStatuses = {}
		chatList.forEach((chat) => {
			initialStatuses[chat.user.id] = false
		})
		setOnlineStatuses(initialStatuses)

		chatList.forEach((chat) => {
			if (!chat.user.id) return

			const cleanup = setupOnlineStatusTracking(
				chat.user.id,
				(userId, isOnline) => {
					setOnlineStatuses((prev) => ({
						...prev,
						[userId]: isOnline,
					}))
				}
			)
			cleanupFunctions.push(cleanup)
		})

		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup && cleanup())
		}
	}, [chatList, currentUser])

	const filteredChats = chatList.filter((chat) =>
		chat.user.username.toLowerCase().includes(search.toLowerCase())
	)

	const handleLogout = async () => {
		const userStatusRef = ref(realtimeDb, `/status/${currentUser.id}`)
		await set(userStatusRef, {
			status: 'offline',
			lastSeen: new Date().toISOString(),
		})

		auth.signOut()
		clearUser()
	}

	const handleSelectChat = (chat) => {
		selectChat(chat)
		isMobile && toggleList()
	}

	return (
		<div className='chat-list'>
			<div className='search'>
				<div className='search-bar'>
					<Search className='search-icon' />
					<input
						type='text'
						placeholder='Search existing chats...'
						onChange={(e) => setSearch(e.target.value)}
						value={search}
					/>
				</div>
				<div
					className='add-chat'
					onClick={() => setAddMode((prev) => !prev)}
				>
					New Chat
				</div>
			</div>
			<div className='bottom'>
				<div className='chats'>
					{filteredChats.map((chat) => (
						<div
							className='item'
							key={chat.chatId}
							onClick={() => handleSelectChat(chat)}
							style={{
								backgroundColor:
									chat?.chatId === chatId
										? '#00BBCE'
										: chat.isSeen
										? 'transparent'
										: 'cornflowerblue',
							}}
						>
							<div className='user-avatar-container'>
								{chat.user.blocked.includes(currentUser.id) ? (
									<User className='icon' />
								) : chat.user.avatar ? (
									<img src={chat.user.avatar} />
								) : (
									<User className='icon' />
								)}
								<div
									className={`online-status ${
										onlineStatuses[chat.user.id] ? 'online' : 'offline'
									}`}
								/>
							</div>
							<div className='texts'>
								<span>
									{chat.user.blocked.includes(currentUser.id)
										? 'User'
										: chat.user.username}
								</span>
								<p>{chat.lastMessage}</p>
							</div>
						</div>
					))}
					{addMode && (
						<AddUser
							addMode={addMode}
							setAddMode={setAddMode}
						/>
					)}
				</div>
				<button
					className='logout'
					onClick={handleLogout}
				>
					Logout
				</button>
			</div>
		</div>
	)
}
