import PropTypes from 'prop-types'
import { ChatList } from './chatList/ChatList'
import './list.css'
import { UserInfo } from './userInfo/UserInfo'

export const List = ({ className }) => {
	return (
		<div className={`list ${className}`}>
			<UserInfo />
			<ChatList />
		</div>
	)
}

List.propTypes = {
	className: PropTypes.string,
}
