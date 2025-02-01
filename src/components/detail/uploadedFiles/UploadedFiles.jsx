import { Download } from 'lucide-react'
import PropTypes from 'prop-types'
import { useImages } from '../../../lib/upload'
import { useUserStore } from '../../../lib/userStore'
import './uploadedFiles.css'

export const UploadedFile = ({ file }) => {
	const fileName =
		file.originalFileName ||
		file.storageRef.split('/').pop().split('_').slice(3).join('_')

	const handleDownload = () => {
		window.open(file.url, '_blank')
	}

	return (
		<div className='photo-item'>
			<div className='photo-detail'>
				<img
					src={file.url}
					alt={fileName}
				/>
				<span>{fileName}</span>
			</div>
			<div className='icon-container'>
				<Download
					className='icon'
					onClick={handleDownload}
				/>
			</div>
		</div>
	)
}

UploadedFile.propTypes = {
	file: PropTypes.object,
}

export const UploadedFiles = () => {
	const { currentUser } = useUserStore()
	const { images, loading, error } = useImages({
		userId: currentUser?.id,
	})

	if (loading) {
		return <div className='no-files'>Loading your uploads...</div>
	}

	if (error) {
		return <div className='no-files'>Error loading your files</div>
	}

	if (!images?.length) {
		return (
			<div className='no-files'>{`You haven't uploaded any files yet`}</div>
		)
	}

	return (
		<div className='photos'>
			{images.map((file) => (
				<UploadedFile
					key={file.id}
					file={file}
				/>
			))}
		</div>
	)
}

UploadedFiles.propTypes = {
	images: PropTypes.array,
	loading: PropTypes.bool,
	error: PropTypes.object,
}
