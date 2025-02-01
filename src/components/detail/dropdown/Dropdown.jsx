import { ChevronDown, ChevronUp } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState } from 'react'
import './dropdown.css'

export const Dropdown = ({ title, children }) => {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div className='option'>
			<div
				className='title'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span>{title}</span>
				<div className='icon-container'>
					{isExpanded ? (
						<ChevronUp className='icon' />
					) : (
						<ChevronDown className='icon' />
					)}
				</div>
			</div>
			{isExpanded && children}
		</div>
	)
}

Dropdown.propTypes = {
	title: PropTypes.string,
	children: PropTypes.node,
}
