import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { User, X } from 'lucide-react'
import { useChatStore } from '../../lib/chatStore'
import { db } from '../../lib/firebase'
import { useImages } from '../../lib/upload'
import { useUserStore } from '../../lib/userStore'
import './detail.css'
import { Dropdown } from './dropdown/Dropdown'
import { SharedFiles } from './sharedFiles/SharedFiles'
import { UploadedFiles } from './uploadedFiles/UploadedFiles'

export const Detail = ({ className }) => {
	const { currentUser } = useUserStore()
	const {
		user,
		chatId,
		isCurrentUserBlocked,
		isReceiverBlocked,
		changeBlock,
		toggleDetail,
		detailVisible,
	} = useChatStore()
	const { images, loading, error } = useImages({ chatId })

	const handleBlock = async () => {
		if (!user) return

		const userDocRef = doc(db, 'users', currentUser.id)

		try {
			await updateDoc(userDocRef, {
				blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
			})
			changeBlock()
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className={`detail ${className}`}>
			<div className='user'>
				{currentUser?.avatar ? (
					<img src={currentUser?.avatar} />
				) : (
					<div className='user-icon'>
						<User className='avatar' />
					</div>
				)}
				<h2>{currentUser?.username}</h2>
				<p>{currentUser?.status}</p>
				<div className='close'>
					<X
						onClick={() => {
							toggleDetail()
						}}
						className='icon'
					/>
				</div>
			</div>
			<div className='info'>
				<Dropdown title='Shared Files'>
					<SharedFiles
						files={images}
						isLoading={loading}
						error={error}
					/>
				</Dropdown>
				<Dropdown title='Uploaded Files'>
					<UploadedFiles />
				</Dropdown>
			</div>
			<div className='buttons'>
				<button
					className='block'
					onClick={handleBlock}
					disabled={isCurrentUserBlocked}
				>
					{isCurrentUserBlocked
						? 'You are blocked'
						: isReceiverBlocked
						? 'User Blocked'
						: 'Block User'}{' '}
				</button>
			</div>
		</div>
	)
}
