import { useEffect, useState } from 'react';
import './Chat.css'
import ChatInfo from './Chat_info';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import GroupChat from './GroupChat';
import ChannelChat from './ChannelChat';
import { auth_service, chat_service, refreshToken, user_service } from '../../properties';
import { useUser } from "../context/UserContext";

function Chats() {

    const { user, setUser } = useUser();

    const navigate = useNavigate()
    const [searchCheck, setSearchCheck] = useState(true)
    const [isClick, setIsClick] = useState(true)

    const [search, setSearch] = useState('')
    const [chats, setChats] = useState([])

    const [userInfo, setUserInfo] = useState([])
    const [userChats, setUserChats] = useState([])
    const [userGroups, setUserGroups] = useState([])
    const [userChannels, setUserChannels] = useState([])
    const [selectedChatId, setSelectedChatId] = useState(null)
    const [chat, setChat] = useState(<></>)
    

    const handleChange = (e) => {
        setSearch(e.target.value)
        if (e.target.value.trim() === '') {
            setSearchCheck(true)
            setSelectedChatId(null) 
            getAllChatsOfUser(user.userId)
        }
    }

    const toSettings = () => navigate("/settings")
    const toGroupCreate = () => navigate("/group")

    const clickChat = (value, chatId, user2Id, bio, name, img, type) => {
        if (!isClick ) {
            console.log('Deselecting chat:', chatId);
            setSelectedChatId(null)
            setIsClick(true)
            setChat(<></>)
        }else {
            let isContact = false
            if (user.contacts && user.contacts.length > 0) {
                for (let i = 0; i < user.contacts.length; i++) {
                    if (user.contacts[i] === user2Id) {       
                        isContact = true
                        break
                    }
                }
            } 
            setIsClick(!value)
            
            if(chatId === null){
                if ( chats.length > 0) {
                    for (let i = 0; i < chats.length; i++) {
                        if (chats[i].type=="PRIVATE" && chats[i].userId[0] === user2Id) {
                            chatId = chats[i].chatId
                            break
                        }else if (chats[i].type=="GROUP" && chats[i].title === name) { 
                            chatId = chats[i].chatId
                            break
                        }
                    }
                    setSelectedChatId(chatId)  
                    setChat(<Chat
                        chatid={chatId}
                        user2Id={user2Id}
                        username={name}
                        img={img}
                        bio={bio}
                        contact={isContact}
                        type={type}
                    />)

                }else{
                    setSelectedChatId(-1)  
                    setChat(<Chat
                        chatid={null}
                        user2Id={user2Id}
                        username={name}
                        img={img}
                        bio={bio}
                        contact={isContact}
                        type={type}
                    />)
                }
            }
            else{
                setSelectedChatId(chatId)  
                setChat(<Chat
                    chatid={chatId}
                    user2Id={user2Id}
                    username={name}
                    img={img}
                    bio={bio}
                    contact={isContact}
                    type={type}
                />)
            }
            
        }
    }

    const refreshToken = async () => {
        try {
            const response = await fetch(`${auth_service}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const token = await response.text()
                localStorage.setItem("token", token)
                return true
            }
            navigate('/')
            return false
        } catch (error) {
            navigate('/')
            return false
        }
    }

    const searchUser = async () => {
        try {
            const response = await fetch(`${user_service}/api/users/username/${search}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id === user.userId) return
                console.log(data)
                setUserInfo([data])
                setSearchCheck(false)
            } else if (response.status === 401) {
                if (await refreshToken()) {
                    await searchUser()
                }
            } else {
                setSearchCheck(true)
            }
        } catch (error) {
            setSearchCheck(true)
            console.error('Ошибка:', error);
        }
    }


    const getAllChatsOfUser = async () => {
        try{
            const response = await fetch(`${chat_service}/api/chats/all/${user.userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
            })
            if(response.ok){
                const data = await response.json()
                setChats(Array.isArray(data) ? data : [data])
                console.log(data)
            }
            else if (response.status === 401) {
                if (await refreshToken()) {
                    await getAllChatsOfUser()
                }
            }

        }catch(error){
            // console.error('Ошибка при загрузке чатов:', error);
        }
    }

    useEffect(() => {
         getAllChatsOfUser()
        
    }, [])

    return (
        <div className='chats_block'>
            <div className="folder_block">
                <div className="user_block">
                    <div className="user_folder_photo" onClick={toSettings}></div>
                    <input className="user_folder_search" placeholder='Поиск' value={search} onChange={handleChange}/>
                    <button className="search_button" onClick={searchUser}>
                        <span className="search_icon">🔍</span>
                    </button>
                </div>

                <div className="folder">
                    {!searchCheck ? (
                        userInfo.map((user, index) => (
                            <ChatInfo
                                key={index}
                                name={user.username}
                                // img = {user.avatar}
                                text=""
                                time=""
                                func={() => clickChat(isClick, null, user.id, user.bio, user.username, user.avatar)}
                                isSelected={selectedChatId === user.id}
                                chatId={user.id}
                            />
                        ))
                    ) : (
                        <>
                            {chats.length != 0 && chats.map( (item, index) => (
                                <ChatInfo
                                    key = {index}
                                    name = {item.title}
                                    img={item.avatar}
                                    text={item.lastMessage?.text || ""}
                                    time={item.lastMessage?.timestamp || ""}
                                    func = {() => clickChat(isClick, item.chatId, item.userId, item.bio, item.title, item.avatar, item.type)}
                                    isSelected={selectedChatId === item.chatId}
                                    chatId={item.chatId}
                                />
                            ))}
                        </>
                    )}
                </div>
                {isClick && (
                    <div className="create_buttons">
                        <button 
                            className="create_button group_create"
                            onClick={toGroupCreate}
                            title="Создать группу"
                        >
                            <span className="create_icon">👥</span>
                            <span className="create_text">Группа</span>
                        </button>
                        <button 
                            className="create_button channel_create"
                            onClick={() => navigate("/channel")}
                            title="Создать канал"
                        >
                            <span className="create_text">📢</span>
                            <span className="create_text">Канал</span>
                        </button>
                        <button
                            className="create_button contact_create"
                            onClick={() => navigate("/contacts")}
                            title="Контакты"
                        >
                            <span className="create_text">👤</span>
                            <span className="create_text">Контакты</span>
                        </button>
                    </div>
                )}
            </div>
            <div className='chat_block'>
                {chat}
            </div>
        </div>
    )
}

export default Chats;