import {
	addDoc,
	collection,
	onSnapshot,
	query,
	where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { db, storage } from './firebase'

const formatDate = (date) => {
	return date.toISOString().split('T')[0].replace(/-/g, '_')
}

export const upload = async (file) => {
	const date = new Date()
	const fileName = `${formatDate(date)}_${file.name}`
	const storageRef = ref(storage, `images/${fileName}`)
	const uploadTask = uploadBytesResumable(storageRef, file)
	const toastId = toast.loading('Starting upload...', {
		position: 'bottom-right',
		autoClose: false,
		closeButton: true,
	})

	return new Promise((resolve, reject) => {
		uploadTask.on(
			'state_changed',
			(snapshot) => {
				const progress = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				)
				toast.update(toastId, {
					render: `Uploading... ${progress}%`,
					type: progress === 100 ? 'success' : 'info',
					isLoading: progress !== 100,
				})
			},
			(error) => {
				toast.update(toastId, {
					render: `Upload failed: ${error.message}`,
					type: 'error',
					isLoading: false,
					autoClose: 3000,
				})
				reject(error)
			},
			async () => {
				try {
					const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
					toast.update(toastId, {
						render: 'Upload completed successfully!',
						type: 'success',
						isLoading: false,
						autoClose: 3000,
					})
					resolve(downloadURL)
				} catch (error) {
					toast.update(toastId, {
						render: `Failed to get download URL: ${error.message}`,
						type: 'error',
						isLoading: false,
						autoClose: 3000,
					})
					reject(error)
				}
			}
		)
	})
}

export const uploadWithMetadata = async (file, userId, chatId = null) => {
	try {
		const downloadURL = await upload(file)
		const date = new Date()
		const fileName = `${formatDate(date)}_${file.name}`

		const imageDoc = await addDoc(collection(db, 'images'), {
			url: downloadURL,
			uploadedBy: userId,
			chatId: chatId,
			timestamp: date,
			originalFileName: file.name,
			storageRef: `images/${fileName}`,
			tags: chatId ? ['chat'] : ['upload'],
		})

		return {
			id: imageDoc.id,
			url: downloadURL,
		}
	} catch (error) {
		toast.error('Failed to save image metadata')
		throw error
	}
}

export const useImages = (filters = {}) => {
	const [images, setImages] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		let baseQuery = collection(db, 'images')
		let constraints = []

		// Build query constraints
		if (filters.userId) {
			constraints.push(where('uploadedBy', '==', filters.userId))
		}
		if (filters.chatId) {
			constraints.push(where('chatId', '==', filters.chatId))
		}
		if (filters.tags) {
			constraints.push(where('tags', 'array-contains-any', filters.tags))
		}

		// Create query with all constraints
		const q = query(baseQuery, ...constraints)

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const imageList = snapshot.docs
					.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					.sort((a, b) => b.timestamp - a.timestamp)

				setImages(imageList)
				setLoading(false)
				setError(null)
			},
			(err) => {
				setError(err)
				setLoading(false)
				toast.error('Failed to fetch images')
			}
		)

		return () => unsubscribe()
	}, [filters.userId, filters.chatId, filters.tags]) // Added proper dependency array

	return { images, loading, error }
}
