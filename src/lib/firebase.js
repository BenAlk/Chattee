// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY,
	authDomain: 'chattee-fc148.firebaseapp.com',
	projectId: 'chattee-fc148',
	storageBucket: 'chattee-fc148.firebasestorage.app',
	messagingSenderId: '1068392953535',
	appId: '1:1068392953535:web:2ca8910ef1d1b2476b380a',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
