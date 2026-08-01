import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { user_service, auth_service } from "../../properties";
import './Forms.css'

function ContactsList(){

    const { user, setUser } = useUser();
    const [contacts, setContacts] = useState([]);

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

    const removeContact = async (contactId) => {
        console.log(contactId)
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
                await getContactsNames(); 
            } else if (response.status === 401) {
                if (await refreshToken()) {
                    await removeContact(contactId);
                }
            } else {
                console.error('Ошибка при удалении контакта:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при удалении контакта:', error);
        }

    };

    useEffect(() => {
        getContactsNames();
    }, [user]);
    

    return(
        <div className="contacts-list">
            <label className="form_label">Контакты</label>
            {contacts && contacts.length > 0 ? (
                <ul>
                    {contacts.map((contact) => (
                        <li key={contact.contactId}>
                            <span>{contact.username}</span>
                            <button onClick={() => removeContact(contact.contactId)}>Удалить</button>
                        </li>

                    ))}
                </ul>
            ) : (
                <p>Нет контактов</p>
            )}
            <button onClick={() => navigate('/chats')}>назад</button>
        </div>
    );

}

export default ContactsList;