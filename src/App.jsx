import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import './App.css'
import { Chat } from './components/chat/Chat'
import { Detail } from './components/detail/Detail'
import { useIsMobile } from './components/hooks/useIsMobile'
import { List } from './components/list/List'
import { Login } from './components/login/Login'
import { Notification } from './components/notification/Notification'
import { useChatStore } from './lib/chatStore'
import { auth } from './lib/firebase'
import { useUserStore } from './lib/userStore'

function App() {
	const { currentUser, isLoading, fetchUserInfo } = useUserStore()
	const { chatId, listVisible, detailVisible } = useChatStore()
	const isMobile = useIsMobile()

	console.log('isMobile', isMobile)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			fetchUserInfo(user?.uid)
		})
		return () => {
			unsubscribe()
		}
	}, [fetchUserInfo])

	if (isLoading) return <div className='loading'>Loading...</div>

	return (
		<div className={`container ${isMobile ? 'mobile-container' : ''}`}>
			{currentUser ? (
				<>
					<List
						className={`pane-list
    ${
			!isMobile
				? `${
						chatId && listVisible && detailVisible
							? 'quarter-left'
							: chatId && !listVisible
							? 'hidden-left'
							: chatId
							? 'third-left'
							: ''
				  }`
				: `${!chatId || listVisible ? 'mobile-full' : 'mobile-hidden-left'}`
		}
  `}
					/>

					<Chat
						className={`pane-chat
    ${
			!isMobile
				? `${
						chatId && !listVisible && detailVisible
							? 'two-third-left'
							: chatId && !listVisible
							? 'full-screen'
							: chatId && listVisible && detailVisible
							? 'half-center'
							: chatId
							? 'two-third-right'
							: ''
				  }`
				: `${
						chatId && !listVisible && !detailVisible
							? 'mobile-full'
							: chatId && listVisible
							? 'mobile-hidden-right'
              : chatId && detailVisible
							? 'mobile-hidden-left'
              : ''
				  }`
		}
  `}
					/>

					<Detail
						className={`pane-detail
    ${
			!isMobile
				? `${
						chatId && listVisible && detailVisible
							? 'quarter-right'
							: chatId && !listVisible && detailVisible
							? 'third-right'
							: ''
				  }`
				: `${detailVisible ? 'mobile-full' : 'mobile-hidden-right'}`
		}
  `}
					/>
				</>
			) : (
				<Login />
			)}
			<Notification />
		</div>
	)
}

export default App
