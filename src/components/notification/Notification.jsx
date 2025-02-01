import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const Notification = () => {
	return (
		<div className='notification'>
			<ToastContainer position='bottom-right' />
		</div>
	)
}
