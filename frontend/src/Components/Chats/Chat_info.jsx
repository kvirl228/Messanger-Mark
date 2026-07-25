import './Chat.css'
function ChatInfo(props){
    return(
        <div className={`chat_folder ${props.isSelected ? 'chat_folder_selected' : ''}`} onClick={props.func}>
            <div className="folder_user_photo"><img src={props.img} className='folder_user_photo'/></div>
            <div className='folder_user_text'>
                <div className="info_user_name_block">{props.name}</div>
                <div className="info_user_block">{props.text}</div>
            </div>
            <div className="folder_time_text">{props.time}</div>
        </div>
    )
}
export default ChatInfo;