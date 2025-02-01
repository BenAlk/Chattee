import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { Image, Info, Smile, User, EllipsisVertical, ArrowLeftFromLine } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../lib/chatStore'
import { db } from '../../lib/firebase'
import { uploadWithMetadata } from '../../lib/upload'
import { useUserStore } from '../../lib/userStore'
import './chat.css'

export const Chat = ({className}) => {
	const [open, setOpen] = useState(false)
	const [text, setText] = useState('')
	const [img, setImg] = useState({
		file: null,
		url: '',
	})

	const { currentUser } = useUserStore()
	const {
		chatId,
		user,
		messages,
		isCurrentUserBlocked,
		isReceiverBlocked,
		toggleDetail,
    toggleList,
	} = useChatStore()

	const endRef = useRef(null)

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' })
	})

	const formatTimeStamp = (timestamp) => {
		const formatTime = (firestoreTimestamp) => {
			if (!firestoreTimestamp) return ''
			const date = firestoreTimestamp.toDate()
			return new Intl.DateTimeFormat('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true,
			}).format(date)
		}
		return <span>{formatTime(timestamp)}</span>
	}

	const handleEmoji = (e) => {
		setText((prev) => prev + e.emoji)
		setOpen((prev) => !prev)
	}

	const handleImg = (e) => {
		if (e.target.files[0]) {
			setImg({
				file: e.target.files[0],
				url: URL.createObjectURL(e.target.files[0]),
			})
		}
	}

	const handleSend = async () => {
		if (text === '' && !img.file) return

		let imageData = null

		try {
			if (img.file) {
				imageData = await uploadWithMetadata(img.file, currentUser.id, chatId)
			}

			await updateDoc(doc(db, 'chats', chatId), {
				messages: arrayUnion({
					senderId: currentUser.id,
					receiverId: user?.id,
					text,
					createdAt: new Date(),
					id: `${Date.now()}_${currentUser.id}`,
					...(imageData && {
						imageId: imageData.id,
						img: imageData.url,
						imageUrl: imageData.url,
					}),
				}),
			})

			const userIDs = [currentUser.id, user?.id]

			userIDs.forEach(async (id) => {
				const userChatsRef = doc(db, 'userchats', id)
				const userChatsSnapshot = await getDoc(userChatsRef)

				if (userChatsSnapshot.exists()) {
					const userChatsData = userChatsSnapshot.data()

					const chatIndex = userChatsData.chats.findIndex(
						(chat) => chat.chatId === chatId
					)

					userChatsData.chats[chatIndex].lastMessage = text
					userChatsData.chats[chatIndex].isSeen =
						id === currentUser.id ? true : false
					userChatsData.chats[chatIndex].updatedAt = Date.now()

					await updateDoc(userChatsRef, {
						chats: userChatsData.chats,
					})
				}
			})
		} catch (error) {
			console.log(error)
		}

		setImg({
			file: null,
			url: '',
		})
		setText('')
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	useEffect(() => {
		const handleEscapeKey = (e) => {
			if (e.key === 'Escape') {
				setOpen(false)
			}
		}

		if (setOpen) {
			document.addEventListener('keydown', handleEscapeKey)
		}

		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [open, setOpen])

    const handleOpenImage = (url) => {
			window.open(url, '_blank')
		}

	return (
		<div className={`chat ${className}`}>
			<div className='top'>
				<EllipsisVertical onClick={toggleList} />
				<div className='user'>
					{user?.avatar ? (
						<img src={user?.avatar} />
					) : (
						<div className='user-icon'>
							<User className='avatar' />
						</div>
					)}
					<div className='texts'>
						<span>{user?.username}</span>
						<p>{user?.status}</p>
					</div>
				</div>
				<div className='icons'>
					<EllipsisVertical
						className='icon'
						onClick={() => toggleDetail()}
					/>
				</div>
			</div>
			<div className='center'>
				{messages?.map((message) => (
					<div
						className={
							message?.senderId === currentUser.id ? 'message own' : 'message'
						}
						key={message?.createdAt}
					>
						{message?.senderId === currentUser.id ? (
							''
						) : user?.avatar ? (
							<img
								className='user-img'
								src={user?.avatar}
							/>
						) : (
							<div className='user-icon'>
								<User className='avatar' />
							</div>
						)}
						<div className='texts'>
							{(message?.img || message?.imageUrl) && (
								<img
									src={message?.img || message?.imageUrl}
									alt=''
									onClick={() =>
										handleOpenImage(message?.img || message?.imageUrl)
									}
								/>
							)}
							{message?.text && <p>{message?.text}</p>}
							<div className='timestamp'>
								{formatTimeStamp(message?.createdAt)}
							</div>
						</div>

					</div>
				))}
				{img?.url && (
					<div className='message own'>
						<div className='texts'>
							<img
								src={img?.url}
								alt=''
							/>
						</div>
					</div>
				)}
				<div ref={endRef}></div>
			</div>
			<div
				className='bottom'
				disabled={isCurrentUserBlocked || isReceiverBlocked}
			>
				<div className='textarea-container'>
					<textarea
						type='text'
						placeholder={
							isCurrentUserBlocked || isReceiverBlocked
								? 'Messages have been disabled.'
								: 'Type a message...'
						}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKeyDown}
						value={text}
						disabled={isCurrentUserBlocked || isReceiverBlocked}
					/>
				</div>
				<div className='icons'>
					<label htmlFor='file'>
						<Image className='icon' />
					</label>
					<input
						type='file'
						id='file'
						style={{ display: 'none' }}
						onChange={handleImg}
						disabled={isCurrentUserBlocked || isReceiverBlocked}
					/>
					<Smile
						className='icon'
						onClick={() => setOpen((prev) => !prev)}
					/>
					<div className='emoji-picker'>
						<EmojiPicker
							open={open}
							onEmojiClick={handleEmoji}
						/>
					</div>
				</div>
				<button
					className='send-button'
					onClick={handleSend}
					disabled={isCurrentUserBlocked || isReceiverBlocked}
				>
					Send
				</button>
			</div>
		</div>
	)
}
