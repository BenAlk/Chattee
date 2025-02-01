import { doc, updateDoc } from 'firebase/firestore'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { db } from '../../../../lib/firebase'
import { useUserStore } from '../../../../lib/userStore'
import './alterStatus.css'

export const AlterStatus = ({ statusMode, setStatusMode }) => {
	const { currentUser } = useUserStore()
	const [currentStatus, setCurrentStatus] = useState(currentUser.status || '')

	const modalAlterFocus = useRef(null)

	const handleBackdropClick = (e) => {
		if (e.target.className === 'modal-backdrop') {
			setStatusMode(false)
		}
	}

	useEffect(() => {
		if (statusMode) {
			modalAlterFocus.current.focus()
		}
	}, [statusMode])

	const handleSubmit = async () => {
		if (!currentUser) return
		try {
			await updateDoc(doc(db, 'users', currentUser.id), {
				status: currentStatus,
			})
			setStatusMode(false)
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		const handleEscapeKey = (e) => {
			if (e.key === 'Escape') {
				setStatusMode(false)
			}
		}

		if (statusMode) {
			document.addEventListener('keydown', handleEscapeKey)
		}

		return () => {
			document.removeEventListener('keydown', handleEscapeKey)
		}
	}, [statusMode, setStatusMode])

	return (
		<div
			className='modal-backdrop'
			onClick={handleBackdropClick}
		>
			<div className='alter-status'>
				<h2>Change your status.</h2>
				<div className='status-input'>
					<input
						type='text'
						placeholder='Enter your status...'
						value={currentStatus}
						ref={modalAlterFocus}
						onChange={(e) => setCurrentStatus(e.target.value)}
					/>
					<button onClick={handleSubmit}>Submit</button>
				</div>
			</div>
		</div>
	)
}

AlterStatus.propTypes = {
	statusMode: PropTypes.bool,
	setStatusMode: PropTypes.func,
}
