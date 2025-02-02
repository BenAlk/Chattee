import { PencilLine, User, X } from 'lucide-react'
import { useState } from 'react'
import { useUserStore } from '../../../lib/userStore'
import { useChatStore } from '../../../lib/chatStore'
import { AlterStatus } from './alterStatus/AlterStatus'
import './userInfo.css'

export const UserInfo = () => {
	const { currentUser } = useUserStore()
  const { toggleList, chatId } = useChatStore()
	const [statusMode, setStatusMode] = useState(false)

	return (
		<div className='user-info'>
			<div className='user'>
				{currentUser.avatar ? (
					<img src={currentUser.avatar} />
				) : (
					<User className='avatar' />
				)}
				<div className='text'>
					<h2>{currentUser?.username}</h2>
					<p>{currentUser?.status}</p>
				</div>
			</div>
			<div className='icons'>
				<PencilLine
					className='user-info-icon'
					onClick={() => setStatusMode((prev) => !prev)}
				/>
        {chatId && <X
          className='user-info-icon'
          onClick={toggleList}
        />}
			</div>
			{statusMode ? (
				<AlterStatus
					statusMode={statusMode}
					setStatusMode={setStatusMode}
				/>
			) : null}
		</div>
	)
}
