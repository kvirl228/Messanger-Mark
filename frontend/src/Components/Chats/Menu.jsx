import { useEffect, useState } from 'react';
import './Chat.css'
import ChatInfo from './Chat_info';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import GroupChat from './GroupChat';
import ChannelChat from './ChannelChat';
import { auth_service, chat_service, refreshToken, user_service } from '../../properties';
import { useUser } from "../context/UserContext";
import WebSocketService from "../../Service/WebSocketService";

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
        console.log('Chat clicked:', { value, chatId, user2Id, bio, name, img, type });
        if (!isClick ) {
            console.log('Deselecting chat:', chatId);
            setSelectedChatId(null)
            setIsClick(true)
            setChat(<></>)
        }else {
            if (type === "GROUP") {
                setSelectedChatId(chatId)
                setIsClick(!value)
                setChat(<GroupChat
                    groupId={chatId}
                    usersIds={user2Id}
                    groupName={name}
                    bio={bio}
                    bio={bio}
                    groupAvatar = {img}
                    type={type}
                    onExit={() => {
                        setChats(prev => prev.filter(chat => chat.chatId !== chatId));
                        setSelectedChatId(null);
                        setIsClick(true);
                        setChat(<></>);
                        
                    }}
                />)

            }else{
                let isContact = false
                if (user.contacts && user.contacts.length > 0) {
                    console.log('Checking if user2Id is in contacts:', user2Id);
                    for (let i = 0; i < user.contacts.length; i++) {
                        console.log('Checking contact:', user.contacts[i]);
                        if (user.contacts[i] == user2Id) {       
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
                            onExit={() => {
                                setChats(prev => prev.filter(chat => chat.chatId !== chatId));
                                setSelectedChatId(null);
                                setIsClick(true);
                                setChat(<></>);
                                
                            }}
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
                            onExit={() => {
                                setChats(prev => prev.filter(chat => chat.chatId !== chatId));
                                setSelectedChatId(null);
                                setIsClick(true);
                                setChat(<></>);
                            }}
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
                        onExit={() => {
                            setChats(prev => prev.filter(chat => chat.chatId !== chatId));
                            setSelectedChatId(null);
                            setIsClick(true);
                            setChat(<></>);
                            
                        }}
                    />)
                }
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
                // setChats(Array.isArray(data) ? data : [data])
                const sortedChats = (Array.isArray(data) ? data : [data])
                .sort((a, b) => {
                    const timeA = a.sendtime 
                        ? new Date(a.sendtime).getTime()
                        : 0;

                    const timeB = b.sendtime 
                        ? new Date(b.sendtime).getTime()
                        : 0;

                    return timeB - timeA;
                });

                setChats(sortedChats);
                console.log("www - ",data)
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
        console.log("User info:", user)
            getAllChatsOfUser()
            console.log("User info:", chats)
            function handleKeyDown(event) {
                if (event.key === 'Escape') {
                    setChat(<></>)
                    setSelectedChatId(null)
                    setIsClick(true)
                }
            }

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
    }, []);

    useEffect(() => {

        const listener = event => {
            console.log("Avatar update:", event);
            setChats(prev =>
            prev.map(chat => {
                if (chat.type=="PRIVATE" && chat.userId[0] === event.userId) {
                    return {
                        ...chat,
                        avatar: event.avatar
                    };
                }
                return chat;
            }));
        };

        WebSocketService.addAvatarListener(listener);

        return () => {
            WebSocketService.removeAvatarListener(listener);
        };

    }, []);

    useEffect(() => {

        const chatListener = (chat) => {
            console.log("ChatList event:", chat);
            if  (chat.responseType === "PRIVATE") {
                const newChat = {
                    title: chat.title,
                    userId: chat.userId,
                    chatId: chat.chatId,
                    type: chat.type,
                    sendtime: chat.sendtime,
                    lastMessage: chat.lastMessage,
                };
                setChats(prev => [newChat, ...prev]);
            }
            
            else if (chat.responseType=="MESSAGE") {
                setChats(prev => {
                const updatedChats = prev.map(c => {
                    if (Number(c.chatId) === Number(chat.chatId)) {
                        return {
                            ...c,
                            lastMessage: chat.lastMessage,
                            sendtime: chat.sendtime
                        };
                    }
                    return c;
                });
                return updatedChats.sort((a, b) => {
                    const timeA = a.sendtime
                        ? new Date(a.sendtime).getTime()
                        : 0;
                    const timeB = b.sendtime
                        ? new Date(b.sendtime).getTime()
                        : 0;
                    return timeB - timeA;
                });});
            }
        };


        WebSocketService.addChatListener(chatListener);

        return () => {
            WebSocketService.removeChatListener(chatListener);
        };
        
    }, [])

    return (
        <div className='chats_block'>
            <div className="folder_block">
                <div className="user_block">
                    <div className="user_folder_photo" onClick={toSettings}><img src={user?.avatar} alt="Avatar" /></div>
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
                                img = {user.avatar}
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
                                    text={item.lastMessage || ""}
                                    time={item.sendtime || ""}
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
                        {/* <button 
                            className="create_button channel_create"
                            onClick={() => navigate("/channel")}
                            title="Создать канал"
                        >
                            <span className="create_text">📢</span>
                            <span className="create_text">Канал</span>
                        </button> */}
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