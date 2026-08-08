import './Chat.css'

function formatChatTime(time) {
    if (!time) return '';

    if (typeof time === 'string') {
        const match = time.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            return `${match[1].padStart(2, '0')}:${match[2]}`;
        }

        const parsed = new Date(time);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    if (time instanceof Date) {
        return time.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return String(time);
}

function ChatInfo(props){
    return(
        <div className={`chat_folder ${props.isSelected ? 'chat_folder_selected' : ''}`} onClick={props.func}>
            <div className="folder_user_photo"><img src={props.img} className='folder_user_photo'/></div>
            <div className='folder_user_text'>
                <div className="info_user_name_block">{props.name}</div>
                <div className="info_user_block">{props.text}</div>
            </div>
            <div className="folder_time_text">{formatChatTime(props.time)}</div>
        </div>
    )
}
export default ChatInfo;