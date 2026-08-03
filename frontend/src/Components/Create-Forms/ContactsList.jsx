import { useUser } from "../context/UserContext";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { user_service, auth_service } from "../../properties";
import './Forms.css'

function ContactsList(){

    const { user, setUser } = useUser();
    const [contacts, setContacts] = useState([]);
    const [query, setQuery] = useState('');
    const [confirmTarget, setConfirmTarget] = useState(null); // <-- inline confirm target
    const navigate = useNavigate();

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

    // removeContact now shows inline confirm first (if not confirmed),
    // and performs backend request only when confirmed
    const removeContact = async (contactId, confirmed = false) => {
        if (!confirmed) {
            setConfirmTarget(contactId);
            return;
        }

        try {
            const response = await fetch(`${user_service}/api/users/delete/contact`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.userId,
                    contactId: contactId
                })
            });
            if (response.ok) {
                setConfirmTarget(null);
                await getContactsNames(); 
                try{
                const userResponse = await fetch(`${user_service}/api/users/user/info/${localStorage.getItem("token")}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (userResponse.ok) {
                    const user = await userResponse.json();
                    setUser(user);
                }
            } catch (error) {
                console.error('Ошибка при получении информации о пользователе:', error);
            }
            }else if (response.status === 401) {
                if (await refreshToken()) {
                    await removeContact(contactId, true);
                } else {
                    setConfirmTarget(null);
                }
            } else {
                console.error('Ошибка при удалении контакта:', response.statusText);
                setConfirmTarget(null);
            }
        } catch (error) {
            console.error('Ошибка при удалении контакта:', error);
            setConfirmTarget(null);
        }
    };

    const getContactsNames = async () => {
        try {
            const response = await fetch(`${user_service}/api/users/contacts/names/${localStorage.getItem("token")}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setContacts(Array.isArray(data) ? data : [data]);
            } else if (response.status === 401) {
                if (await refreshToken()) {
                    await getContactsNames();
                }
            } else {
                console.error('Ошибка при получении списка контактов:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при получении списка контактов:', error);
        }
    };

    useEffect(() => {
        getContactsNames();
    }, [user]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter(c => (c.username || '').toLowerCase().includes(q));
    }, [contacts, query]);

    const initials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
    }

    return(
        <div className="contacts-list card">
            <div className="contacts-header">
                <div>
                    <h3 className="contacts-title">Контакты</h3>
                    <div className="contacts-sub">{contacts.length} {contacts.length === 1 ? 'контакт' : 'контактов'}</div>
                </div>
                <div className="contacts-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/chats')}>Назад</button>
                </div>
            </div>

            <div className="contacts-search">
                <input
                    className="contacts-search-input"
                    placeholder="Поиск по имени..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* inline confirm bar */}
            {confirmTarget && (
                <div className="contacts-confirm">
                    <div>Удалить контакт?</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-danger" onClick={() => removeContact(confirmTarget, true)}>Удалить</button>
                        <button className="btn btn-secondary" onClick={() => setConfirmTarget(null)}>Отмена</button>
                    </div>
                </div>
            )}

            <div className="contacts-list-body">
                {filtered && filtered.length > 0 ? (
                    <ul className="contacts-items">
                        {filtered.map((contact) => (
                            <li key={contact.contactId} className="contacts-item">
                                <div className="contact-left">
                                    <div className="contact-avatar">{initials(contact.username)}</div>
                                    <div className="contact-name">{contact.username}</div>
                                </div>
                                <div className="contact-actions">
                                    <button className="btn btn-danger" onClick={() => removeContact(contact.contactId)}>Удалить</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="contacts-empty">Нет контактов{query ? ' по запросу' : ''} <span className="hint">😶</span></div>
                )}
            </div>
        </div>
    );

}

export default ContactsList;