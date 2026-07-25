import { useEffect, useState } from 'react';
import './Chat.css'
import ChatInfo from './Chat_info';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import GroupChat from './GroupChat';
import ChannelChat from './ChannelChat';
import { auth_service, chat_service, refreshToken, user_service } from '../../properties';

function Chats() {
    const navigate = useNavigate()
    const [searchCheck, setSearchCheck] = useState(true)
    const [isClick, setIsClick] = useState(true)
    const [userid, setuserId] = useState(-1)
    const [search, setSearch] = useState('')
    const [chats, setChats] = useState([])


    const [userInfo, setUserInfo] = useState([])
    const [userChats, setUserChats] = useState([])
    const [userGroups, setUserGroups] = useState([])
    const [userChannels, setUserChannels] = useState([])
    const [activeCategory, setActiveCategory] = useState('chats') 
    const [selectedChatId, setSelectedChatId] = useState(null)
    const [chat, setChat] = useState(<></>)
    

    const handleChange = (e) => {
        setSearch(e.target.value)
        if (e.target.value.trim() === '') {
            setSearchCheck(true)
            setSelectedChatId(null) 
            getAllChatsOfUser(userid)
        }
    }

    const toSettings = () => navigate("/settings")
    const toGroupCreate = () => navigate("/group")

    const clickChat = (value, id, name, img, creatorId) => {
        if (selectedChatId === id) {
            console.log('Deselecting chat:', id)
            setSelectedChatId(null)
            setIsClick(true)
            setChat(<></>)
        } else {
            console.log('Selecting new chat:', id)
            setIsClick(!value)
            setSelectedChatId(id)

            if(activeCategory === 'chats'){
                setChat(<Chat
                    userId={userid}
                    user2Id={id}
                    username={name}
                    img={img}
                />)
            }
            else if(activeCategory == 'groups'){
                setChat(<GroupChat
                    userId={userid}
                    groupId={id}
                    groupName={name}
                    groupAvatar={img}
                    creatorId={creatorId}
                />)
            }
            else if(activeCategory == 'channels'){
                setChat(<ChannelChat
                            userId={userid}
                            channelId={id}
                            channelName={name}
                            channelAvatar = {img}
                            ownerId={creatorId}
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
                if (data.id === userid) return
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

    const getUserId = async () => {
        try {
            const response = await fetch(`${user_service}/api/users/userid/${localStorage.getItem("token")}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setuserId(data)
                return data
            } else if (response.status === 401) {
                if (await refreshToken()) {
                    return await getUserId()
                }
            }
            return null
        } catch (error) {
            console.error('Ошибка:', error);
            return null
        }
    }

    const getAllChatsOfUser = async (id) => {
        try{
            const response = await fetch(`${chat_service}/api/chats/all/${id}`, {
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
                    await getAllChatsOfUser(id)
                }
            }

        }catch(error){
            console.error('Ошибка при загрузке чатов:', error);
        }
    }

    useEffect(() => {
        const init = async () => {
            const id = await getUserId()
            console.log(localStorage.getItem("token"))
            if (id) {
                await getAllChatsOfUser(id)
            }
        }
        init()
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
                        // Поиск пользователей
                        userInfo.map((user, index) => (
                            <ChatInfo
                                key={index}
                                name={user.username}
                                // img = {user.avatar}
                                text=""
                                time=""
                                func={() => clickChat(isClick, user.id, user.username, user.avatar)}
                                isSelected={selectedChatId === user.id}
                                chatId={user.id}
                            />
                        ))
                    ) : (
                        // Отображаем данные в зависимости от активной категории
                        <>
                            {chats.length != 0 && chats.map( (item, index) => (
                                <ChatInfo
                                    key = {index}
                                    name = {item.title}
                                    img={item.avatar}
                                    text={item.lastMessage?.text || ""}
                                    time={item.lastMessage?.timestamp || ""}
                                    func = {() => clickChat(isClick, item.chatId, item.title, item.avatar)}
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