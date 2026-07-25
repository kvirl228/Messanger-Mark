import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import './Forms.css'

function Channel(props){

    const [channelName, setChannelName] = useState('')
    const [channelDescription, setChannelDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState([])
    const [userid, setuserId] = useState(-1)
    const [contacts, setContacts] = useState([])
    const [selectedContacts, setSelectedContacts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    

    const navigate = useNavigate()

    const handleChannelName = (event) => {
        setChannelName(event.target.value)
    }

    const handleChannelDescription = (event) => {
        setChannelDescription(event.target.value)
    }

    const handleSearchQuery = (event) => {
        setSearchQuery(event.target.value)
    }

    const toggleContactSelection = (contactId) => {
        setSelectedContacts(prev => 
            prev.includes(contactId) 
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        )
    }

    async function refresh(){
        try {
        const response = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json"
          },
        });

        if (response.ok) {
          const token = await response.text()
          localStorage.setItem("token", token)
        } else {
        
        }
      } catch (error) {
      
      }
    }

    const getUserId = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/id/${localStorage.getItem("token")}`, {
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
                if (await refresh()) {
                    return await getUserId()
                }
            }
            return null
        } catch (error) {
            console.error('Ошибка:', error);
            return null
        }
    }

    const fetchContacts = async (ids) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/contacts/findAll/${ids}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            } else if (response.status === 401) {
                if (await refresh()) {
                    await fetchContacts();
                }
            }
        } catch (error) {
            console.error('Ошибка при получении контактов:', error);
        }
    }

    async function createChannel () {
        if (!channelName.trim()) {
            alert('Пожалуйста, введите название канала');
            return;
        }

        setIsLoading(true);
        
        try {
        const response = await fetch(`http://localhost:8080/api/channel/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                channelName: channelName,
                ownerId: userid,
                usersToAdd: selectedContacts
            }),
        }
        );
        if(response.ok){
            await refresh()
            alert("Канал успешно создан! 🎉")
            navigate('/chats')
        }
        else{
            alert("Ошибка при создании канала")
        }
        } catch (error) {
            console.error('Ошибка:', error);
            alert("Ошибка при создании канала")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const init = async () => {
            const id = await getUserId()
            await fetchContacts(id)
        }
        init()
    }, [])

    function toChats(){
        navigate('/chats')
    }

    const filteredContacts = contacts.filter(contact => 
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return(
        <div className="forms_block_settings">
            <div className="channel-form-container">
                <div className="channel-form-header">
                    <button className="channel-form-close" onClick={toChats}>
                        <span className="close-icon">✕</span>
                    </button>
                    <div className="channel-form-title">
                        <div className="channel-form-icon">📢</div>
                        <h1>Создать канал</h1>
                    </div>
                    <p className="channel-form-subtitle">Создайте новый канал для публикации контента</p>
                </div>

                <form className="channel-form" onSubmit={(e) => { e.preventDefault(); createChannel(); }}>
                    <div className="channel-form-field">
                        <label className="channel-form-label">
                            <span className="label-icon">📝</span>
                            Название канала
                        </label>
                        <input 
                            className="channel-form-input" 
                            value={channelName} 
                            onChange={handleChannelName} 
                            placeholder="Введите название канала"
                            maxLength={50}
                        />
                        <div className="input-counter">{channelName.length}/50</div>
                    </div>

                    <div className="channel-form-field">
                        <label className="channel-form-label">
                            <span className="label-icon">📄</span>
                            Описание канала (необязательно)
                        </label>
                        <textarea 
                            className="channel-form-textarea" 
                            value={channelDescription} 
                            onChange={handleChannelDescription} 
                            placeholder="Расскажите о канале..."
                            maxLength={200}
                            rows={3}
                        />
                        <div className="input-counter">{channelDescription.length}/200</div>
                    </div>

                    <div className="channel-form-field">
                        <label className="channel-form-label">
                            <span className="label-icon">👥</span>
                            Добавить участников
                        </label>
                        <div className="contacts-search-container">
                            <input 
                                className="contacts-search-input" 
                                value={searchQuery} 
                                onChange={handleSearchQuery} 
                                placeholder="Поиск контактов..."
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="contacts-list">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className={`contact-item ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}
                                        onClick={() => toggleContactSelection(contact.id)}
                                    >
                                        <div className="contact-avatar">
                                            {contact.avatar ? (
                                                <img src={contact.avatar} alt="Avatar" />
                                            ) : (
                                                <span className="avatar-placeholder">👤</span>
                                            )}
                                        </div>
                                        <div className="contact-info">
                                            <span className="contact-name">{contact.username}</span>
                                            <span className="contact-status">
                                                {contact.online ? '🟢 В сети' : '⚪ Не в сети'}
                                            </span>
                                        </div>
                                        <div className="contact-checkbox">
                                            {selectedContacts.includes(contact.id) && (
                                                <span className="checkmark">✓</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-contacts">
                                    <span className="no-contacts-icon">📭</span>
                                    <p>Контакты не найдены</p>
                                </div>
                            )}
                        </div>
                        
                        {selectedContacts.length > 0 && (
                            <div className="selected-contacts-info">
                                Выбрано участников: {selectedContacts.length}
                            </div>
                        )}
                    </div>

                    <div className="channel-form-actions">
                        <button 
                            type="button" 
                            className="channel-form-btn-secondary" 
                            onClick={toChats}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="channel-form-btn-primary" 
                            disabled={isLoading || !channelName.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">✨</span>
                                    Создать канал
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Channel;
