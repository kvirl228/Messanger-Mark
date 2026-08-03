import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { user_service, auth_service, chat_service } from "../../properties"
import { useUser } from "../context/UserContext"
import './Forms.css'

function Group(props){

    const { user, setUser } = useUser();

    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    // const [user, setUser] = useState([])
    // const [userid, setuserId] = useState(-1)
    const [contacts, setContacts] = useState([])
    const [selectedContacts, setSelectedContacts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    

    const navigate = useNavigate()

    const handleGroupName = (event) => {
        setGroupName(event.target.value)
    }

    const handleGroupDescription = (event) => {
        setGroupDescription(event.target.value)
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
        const response = await fetch(`${auth_service}/auth/refresh`, {
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

    const fetchContacts = async () => {
            try {
                const response = await fetch(`${user_service}/api/users/contacts/names/${localStorage.getItem("token")}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setContacts(Array.isArray(data) ? data : [data]);
                } else if (response.status === 401) {
                    if (await refresh()) {
                        await fetchContacts();
                    }
                }
            } catch (error) {
                console.error('Ошибка при получении контактов:', error);
            }
        }
    

    async function createGroup () {
        if (!groupName.trim()) {
            alert('Пожалуйста, введите название группы');
            return;
        }

        setIsLoading(true);
        console.log("Создание группы с названием:", selectedContacts, groupName, groupDescription);
        try {
            const response = await fetch(`${chat_service}/api/chats/group/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    title: groupName,
                    bio: groupDescription,
                    ownerId: user.userId,
                    memberIds: selectedContacts
                }),
            });
            if(response.ok){
                await refresh()
                alert("Группа успешно создана! 🎉")
                navigate('/chats')
            }
            else{
                alert("Ошибка при создании группы")
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert("Ошибка при создании группы")
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
            fetchContacts()
    }, [])

    function toChats(){
        navigate('/chats')
    }

    const filteredContacts = contacts.filter(contact => 
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return(
        <div className="forms_block_settings">
            <div className="group-form-container">
                <div className="group-form-header">
                    <button className="group-form-close" onClick={toChats}>
                        <span className="close-icon">✕</span>
                    </button>
                    <div className="group-form-title">
                        <div className="group-form-icon">👥</div>
                        <h1>Создать группу</h1>
                    </div>
                    <p className="group-form-subtitle">Создайте новую группу для общения с друзьями</p>
                </div>

                <form className="group-form" onSubmit={(e) => { e.preventDefault(); createGroup(); }}>
                    <div className="group-form-field">
                        <label className="group-form-label">
                            <span className="label-icon">📝</span>
                            Название группы
                        </label>
                        <input className="group-form-input" value={groupName}  onChange={handleGroupName} placeholder="Введите название группы" maxLength={50}/>
                        <div className="input-counter">{groupName.length}/50</div>
                    </div>

                    <div className="group-form-field">
                        <label className="group-form-label">
                            <span className="label-icon">📄</span>
                            Описание группы (необязательно)
                        </label>
                        <textarea className="group-form-textarea" value={groupDescription} onChange={handleGroupDescription} placeholder="Расскажите о группе..." maxLength={200} rows={3}/>
                        <div className="input-counter">{groupDescription.length}/200</div>
                    </div>

                    <div className="group-form-field">
                        <label className="group-form-label">
                            <span className="label-icon">👥</span>
                            Добавить участников
                        </label>
                        <div className="contacts-search-container">
                            <input className="contacts-search-input" value={searchQuery} onChange={handleSearchQuery} placeholder="Поиск контактов..."/>
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="contacts-list">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className={`contact-item ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}
                                        onClick={() => toggleContactSelection(contact.contactId)}
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

                    <div className="group-form-actions">
                        <button 
                            type="button" 
                            className="group-form-btn-secondary" 
                            onClick={toChats}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="group-form-btn-primary" 
                            disabled={isLoading || !groupName.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">✨</span>
                                    Создать группу
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Group;