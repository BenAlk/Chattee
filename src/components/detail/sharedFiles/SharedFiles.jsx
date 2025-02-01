import { Download } from 'lucide-react'
import PropTypes from 'prop-types'
import './sharedFiles.css'

export const SharedFile = ({ file }) => {
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

SharedFile.propTypes = {
	file: PropTypes.object,
}

export const SharedFiles = ({ files, isLoading, error }) => {
	if (isLoading) {
		return <div className='no-files'>Loading shared files...</div>
	}

	if (error) {
		return <div className='no-files'>Error loading files</div>
	}

	if (!files?.length) {
		return <div className='no-files'>No shared files</div>
	}

	return (
		<div className='photos'>
			{files.map((file) => (
				<SharedFile
					key={file.id}
					file={file}
				/>
			))}
		</div>
	)
}

SharedFiles.propTypes = {
	files: PropTypes.array,
	isLoading: PropTypes.bool,
	error: PropTypes.object,
}
