import { useEffect, useState, useRef } from "react";
import { auth_service, user_service, chat_service, message_service } from "../../properties"
import './Chat.css';

import { useUser } from "../context/UserContext";
import WebSocketService from "../../Service/WebSocketService";

function Chat({ chatid, user2Id, username ,bio, img, contact, type}) {

  const { user, setUser } = useUser();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isClick, setIsClick] = useState(true)
  const [chatId, setChatId] = useState(chatid);
  const [deleteId, setDeleteId] = useState(0)
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isContact, setIsContact] = useState(contact);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setIsClick(true); // Закрываем панель удаления при редактировании
  }

  const refreshToken = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const token = await response.text()
        localStorage.setItem("token", token)
        return true
      }

      return false
    } catch (error) {

      return false
    }
  }
    
  const sendMessage = () => {
    if (inputText.trim() === "") return;
    // Первый диалог
    if (chatId == null) {
        WebSocketService.send("/app/chat.start", {
            recipientId: user2Id,
            text: inputText
        });
    }
    // Обычное сообщение
    else {

        WebSocketService.send("/app/chat.send", {
            chatId: chatId,
            text: inputText
        });
        scrollToBottom();

    }

    setInputText("");

  };

  const deleteMessage = (messageId) => {
    WebSocketService.send("/app/chat.delete", {
        messageId: messageId
    });
  }

  const editMessage = (messageId, newText) => {
    console.log("EDIT MESSAGE:", messageId, newText);
    WebSocketService.send("/app/chat.edit", {
        messageId: messageId,
        newText: newText
    });
    setEditingMessageId(null);
    setEditingText('');
  }
  
  const getMessages = async () => {
    console.log("GET MESSAGES FOR CHAT ID:", chatId);
    try {
      const response = await fetch(`${message_service}/api/messages/all/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }); if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : [data]);
        console.log("MESSAGES:", data);
      } else {
        console.error('Ошибка при получении сообщений');
      }
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
    }
  }

  const click = (clicker, id) => {
    setIsClick(clicker)
    setDeleteId(id)
  }

  const handleUsernameClick = async () => {
    // checkContact();
    setShowUserPopup(true);
    setUserInfo({
      username: username,
      online: true,
      bio: bio 
    });
  }

  const addToContacts = async () => {
    try {
      console.log(user.userId, user2Id)
      const response = await fetch(`${user_service}/api/users/add/contact`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          contactId: user2Id[0],
        })
      });
      if (response.ok) {
        setIsContact(true)
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
                    console.log("User info updated after adding contact:", user);
                }
            } catch (error) {
                console.error('Ошибка при получении информации о пользователе:', error);
            }
        alert("yes")
      }
      else {
        alert("Eror")
      }
    } catch (error) {
      alert(error)
    }
  }

  const removeFromContacts = async () => {
    console.log(user.userId, user2Id)
    try {
      const response = await fetch(`${user_service}/api/users/delete/contact`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          contactId: user2Id[0]
        })
      });
      if (response.ok) {
        setIsContact(false)
        alert("yes")
      }
      else {
        alert("Eror")
      }
    } catch (error) {
      alert(error)
    }
  }

  const closeUserPopup = () => {
    setShowUserPopup(false);
    setUserInfo(null);
  }

  const deleteChat = async () => {
    try {
      const response = await fetch(`${chat_service}/api/chats/delete/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        window.location.reload();
        alert("yes")
      }
      else {
        alert("Eror")
      }
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    console.log(chatId, user2Id, username, bio, img, contact, type)
    getMessages();
    scrollToBottom();
    const listener = (message) => {
      console.log("Received message:", message);
      if (message.type === "DELETE") {
          setMessages(prev => prev.filter(m => m.id !== message.messageId));
        return;
      }
      if (message.type === "EDIT") {
        console.log("Editing message:", message.id, message.text);
        setMessages(prev =>
            prev.map(m =>
                m.id === message.id
                    ? message
                    : m
            )
        );
        return;
      }
      if (message.type === "MESSAGE") {
        if (message.chatId !== chatId && chatId !== null) {
          return;
        }
        setMessages(prev => [...prev, message]);
      }
      if(message.type == "PRIVATE"){
        return;
      }
    };

      

    WebSocketService.addListener(listener);

    return () => {

        WebSocketService.removeListener(listener);

    };

    

    
  }, [])

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info" onClick={handleUsernameClick}>
          <div className="chat-user-avatar">
            {img != null ? (
              <img src={img} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
            <div className="online-indicator">
              {userInfo?.online ? '🟢' : '⚪'}
            </div>
          </div>
          <div className="chat-user-info">
            <h3 className="chat-username">{username}</h3>
            <p className="chat-status">
              {userInfo?.online ? 'В сети' : 'Не в сети'}
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" title="Поиск">
            <span className="action-icon">🔍</span>
          </button>
          <button className="chat-action-btn" title="Настройки">
            <span className="action-icon">⚙️</span>
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <h3>Начните разговор</h3>
            <p>Отправьте первое сообщение, чтобы начать общение с {username}</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`message-wrapper ${msg.senderid === user.userId ? 'my_message' : 'their_message'}`}>
                <div className="message-bubble">
                  {editingMessageId === msg.id ? (
                    // Режим редактирования
                    <div className="message-edit-container">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="message-edit-input"
                        autoFocus
                      />
                      <div className="message-edit-actions">
                        <button 
                          className="edit-save-btn"
                          onClick={() => editMessage(msg.id, editingText)}
                          // disabled={!editingText.trim()}
                        >
                          💾
                        </button>
                        <button 
                          className="edit-cancel-btn"
                          // onClick={cancelEditing}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Обычный режим отображения
                    <>
                      <div className="message-content">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {msg.senderid === user.userId && (
                        <div className="message-status">
                          {msg.userid}
                        </div>
                      )}
                      {msg.senderid === user.userId && (
                        <div className="message-actions">
                          <button 
                            className="message-action-btn edit-btn"
                            onClick={() => startEditing(msg.id, msg.message)}
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button 
                            className="message-action-btn delete-btn"
                            onClick={deleteMessage.bind(null, msg.id)}
                            // onClick={() => click(!isClick, msg.id)}
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isClick ? (
        <div className="chat-input-panel">
          <div className="input-container">
            <button className="attachment-btn" title="Прикрепить файл">
              <span className="attachment-icon">📎</span>
            </button>
            <div className="input-wrapper">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Введите сообщение..."
                className="chat-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    // e.preventDefault();
                    // if (!inputText.trim()) {
                    //   sendMessage();
                    // }
                  }
                }}
              />
              <button className="emoji-btn" title="Эмодзи">
                <span className="emoji-icon">😊</span>
              </button>
            </div>
            <button
              className="send-btn"
              onClick={sendMessage}
              // disabled={!inputText.trim()}
              title="Отправить"
            >
              <span className="send-icon">📤</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="delete-panel">
          {editingMessageId ? (
            // Панель редактирования
            <div className="edit-panel">
              <div className="edit-panel-header">
                <span>Редактирование сообщения</span>
              </div>
              <div className="input-wrapper">
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Введите новый текст..."
                  className="chat-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // if (editingText.trim()) {
                        editMessage(editingMessageId, editingText);
                      // }
                    }
                  }}
                />
              </div>
              <div className="edit-panel-actions">
                <button 
                  className="save-btn" 
                  onClick={() => editMessage(editingMessageId, editingText)}
                  // disabled={!editingText.trim()}
                >
                  💾 Сохранить
                </button>
                <button className="cancel-btn" >
                  ❌ Отмена
                </button>
              </div>
            </div>
          ) : (
            // Панель удаления
            <>
              <button className="delete-btn"
              //  onClick={() => deleteMessage(deleteId)}
               >
                <span className="delete-icon">🗑️</span>
                Удалить сообщение
              </button>
              <button className="cancel-btn" 
              onClick={() => setIsClick(true)}>
                Отмена
              </button>
            </>
          )}

          <div className="input-wrapper">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите сообщение..."
              className="chat-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // if (inputText.trim()) {
                  //   sendMessage();
                  // }
                }
              }}
            />
            <button className="emoji-btn" title="Эмодзи">
              <span className="emoji-icon">😊</span>
            </button>
          </div>
          <button
            className="send-btn"
            // onClick={sendMessage}
            disabled={!inputText.trim()}
            title="Отправить"
          >
            <span className="send-icon">📤</span>
          </button>
        </div>
      )}

     
      {showUserPopup && (
        <div className="user-popup-overlay" onClick={closeUserPopup}>
          <div className="user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="user-popup-header">
              <div className="user-popup-avatar">
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="Avatar" />
                ) : (
                  <div className="user-popup-avatar-placeholder">👤</div>
                )}
              </div>
              <div className="user-popup-info">
                <h3 className="user-popup-name">{userInfo?.username || username}</h3>
                <p className="user-popup-status">
                  {userInfo?.online ? '🟢 В сети' : '⚪ Не в сети'}
                </p>
              </div>
              <button className="user-popup-close" onClick={closeUserPopup}>✕</button>
            </div>

            <div className="user-popup-content">
              {userInfo?.bio && (
                <div className="user-popup-bio">
                  <h4>О себе:</h4>
                  <p>{userInfo.bio}</p>
                </div>
              )}

              <div className="user-popup-actions">
                {isContact ? (
                  <button className="user-popup-button add-contact" onClick={removeFromContacts}>
                    🗑️ Удалить из контактов
                  </button>
                ) : (
                  <button className="user-popup-button remove-contact " onClick={addToContacts}>
                    👥 Добавить в контакты
                  </button>
                )}

                <button className="user-popup-button delete-btn" onClick={() => deleteChat()}>
                  🗑️ Удалить чат
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;