import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { auth, db } from '../../lib/firebase'
import { upload } from '../../lib/upload'
import { useIsMobile } from '../hooks/useIsMobile'
import './login.css'

export const Login = () => {
	const [avatar, setAvatar] = useState(null)
	const [loading, setLoading] = useState(false)
	const isMobile = useIsMobile()

	const handleLogin = async (e) => {
		e.preventDefault()
		setLoading(true)

		const formData = new FormData(e.target)
		const { email, password } = Object.fromEntries(formData)

		try {
			await signInWithEmailAndPassword(auth, email, password)
		} catch (error) {
			console.log(error)
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		setLoading(true)
		const formData = new FormData(e.target)
		const { username, email, password } = Object.fromEntries(formData)
		try {
			let imgURL = null
			const response = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			)
			if (avatar) {
				imgURL = await upload(avatar.file)
			}
			await setDoc(doc(db, 'users', response.user.uid), {
				username,
				email,
				status: null,
				avatar: imgURL || null,
				id: response.user.uid,
				blocked: [],
			})

			await setDoc(doc(db, 'userchats', response.user.uid), {
				chats: [],
			})

			toast.success('Account created successfully')
		} catch (error) {
			console.log(error)
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	const handleAvatar = (e) => {
		if (e.target.files.length === 0) return
		setAvatar((prev) => ({
			...prev,
			file: e.target.files[0],
			url: URL.createObjectURL(e.target.files[0]),
		}))
	}

	return (
		<div className={`login ${isMobile ? 'mobile' : ''}`}>
			<div className='item'>
				<h2>Welcome back</h2>
				<form onSubmit={handleLogin}>
					<input
						type='email'
						placeholder='Email'
						name='email'
					/>
					<input
						type='password'
						placeholder='Password'
						name='password'
					/>
					<button disabled={loading}>
						{loading ? 'loading... ' : 'Sign In'}
					</button>
				</form>
			</div>
			<div className='separator'></div>
			<div className='item'>
				<h2>Create an Account </h2>
				<form onSubmit={handleRegister}>
					<input
						type='text'
						placeholder='Username'
						name='username'
					/>
					<input
						type='file'
						id='file'
						name='file'
						style={{ display: 'none' }}
						onChange={handleAvatar}
					/>
					<label htmlFor='file'>
						{avatar ? <img src={avatar.url} /> : <User className='avatar' />}
						Upload custom avatar
					</label>
					<input
						type='email'
						placeholder='Email'
						name='email'
					/>
					<input
						type='password'
						placeholder='Password'
						name='password'
					/>
					<button disabled={loading}>
						{loading ? 'loading... ' : 'Sign Up'}
					</button>
				</form>
			</div>
		</div>
	)
}
