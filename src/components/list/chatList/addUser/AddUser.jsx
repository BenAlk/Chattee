import {
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore'
import { User } from 'lucide-react'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../../../lib/chatStore'
import { db } from '../../../../lib/firebase'
import { useUserStore } from '../../../../lib/userStore'
import './addUser.css'

export const AddUser = ({ addMode, setAddMode }) => {
	const [users, setUsers] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSearching, setIsSearching] = useState(false)
	const { currentUser } = useUserStore()
	const { changeChat } = useChatStore()
	const modalFocus = useRef(null)

	useEffect(() => {
		const searchUsers = async () => {
			if (searchTerm === '') {
				setUsers([])
				setIsLoading(false)
				setIsSearching(false)
				return
			}

			setIsLoading(true)
			setIsSearching(true)

			try {
				const userRef = collection(db, 'users')
				const q = query(
					userRef,
					where('usernameLower', '>=', searchTerm.toLowerCase()),
					where('usernameLower', '<=', searchTerm.toLowerCase() + '\uf8ff'),
					orderBy('usernameLower')
				)

				const querySnapshot = await getDocs(q)
				const userList = querySnapshot.docs
					.map((doc) => ({
						...doc.data(),
						id: doc.id,
					}))
					.filter((user) => user.id !== currentUser.id)

				setTimeout(() => {
					setUsers(userList)
					setIsLoading(false)
				}, 500)
			} catch (error) {
				console.log(error)
				setIsLoading(false)
			}
		}

		const timeoutId = setTimeout(() => {
			searchUsers()
		}, 500)

		return () => clearTimeout(timeoutId)
	}, [searchTerm, currentUser.id])

	useEffect(() => {
		if (addMode) {
			modalFocus.current.focus()
		}
	}, [addMode])

	const handleAddUser = async (user) => {
		const chatRef = collection(db, 'chats')
		const userChatsRef = collection(db, 'userchats')

		try {
			const userChatsDoc = await getDoc(doc(userChatsRef, currentUser.id))
			const userChats = userChatsDoc.data()?.chats || []

			const existingChat = userChats.find((chat) => chat.receiverId === user.id)

			if (existingChat) {
				changeChat(existingChat.chatId, user)
				setAddMode(false)
				return existingChat.chatId
			}

			const newChatRef = doc(chatRef)

			await setDoc(newChatRef, {
				createdAt: serverTimestamp(),
				messages: [],
			})

			await updateDoc(doc(userChatsRef, user.id), {
				chats: arrayUnion({
					chatId: newChatRef.id,
					lastMessage: '',
					receiverId: currentUser.id,
					updatedAt: Date.now(),
				}),
			})

			await updateDoc(doc(userChatsRef, currentUser.id), {
				chats: arrayUnion({
					chatId: newChatRef.id,
					lastMessage: '',
					receiverId: user.id,
					updatedAt: Date.now(),
				}),
			})

			changeChat(newChatRef.id, user)
			setAddMode(false)
			return newChatRef.id
		} catch (error) {
			console.log(error)
		}
	}

	const handleBackdropClick = (e) => {
		if (e.target.className === 'modal-backdrop') {
			setAddMode(false)
		}
	}

	useEffect(() => {
		const handleEscapeKey = (e) => {
			if (e.key === 'Escape') {
				setAddMode(false)
			}
		}

		if (addMode) {
			document.addEventListener('keydown', handleEscapeKey)
		}

		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [addMode, setAddMode])

	return (
		<div
			className='modal-backdrop'
			onClick={handleBackdropClick}
		>
			<div className='add-user'>
				<h2>Search for a user.</h2>
				<div className='search-input'>
					<input
						type='search'
						placeholder='Search username...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						ref={modalFocus}
					/>
				</div>
				<div className='users-list'>
					{users.map((user) => (
						<div
							key={user.id}
							className='user'
						>
							<div className='detail'>
								{user.avatar ? (
									<img
										src={user.avatar}
										alt={user.username}
									/>
								) : (
									<div className='avatar'>
										<User
											height='50px'
											width='50px'
										/>
									</div>
								)}
								<span>{user.username}</span>
							</div>
							<button onClick={() => handleAddUser(user)}>Add User</button>
						</div>
					))}
					{isLoading ? (
						<div className='loading'>Loading...</div>
					) : (
						isSearching &&
						users.length === 0 && (
							<div className='no-results'>No users found</div>
						)
					)}
				</div>
			</div>
		</div>
	)
}

AddUser.propTypes = {
	addMode: PropTypes.bool,
	setAddMode: PropTypes.func,
}
