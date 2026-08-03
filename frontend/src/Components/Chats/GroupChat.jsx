import { useEffect, useState } from "react";
import { auth_service, chat_service, user_service } from '../../properties';
import './Chat.css';
import { useUser } from "../context/UserContext";

function GroupChat({ usersIds ,groupId, groupName, groupAvatar, creatorId }) {
  const { user, setUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isClick, setIsClick] = useState(true)
  const [deleteId, setDeleteId] = useState(0)
  const [image, setImage] = useState(null);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [url, setUrl] = useState('');
  const [userId, setUserId] = useState(user.userId);
  
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleImageChange = (event) => {
        setImage(event.target.files[0]);
    };

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
      return false
    } catch (error) {
      return false
    }
  }

  const sendMessage = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/group-messages/send/${groupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputText,
          senderId: userId,
        })
      });

      if (response.ok) {
        const message = await response.json()
        const newMessage = [...messages, message]
        setMessages(newMessage)
        console.log(userId)
      }
      else {
        alert("Error")
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }

    setInputText('')
  }

  // Функция для редактирования сообщения
  const editMessage = async (messageId, newText) => {
    try {
      const response = await fetch(`http://localhost:8080/api/group-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newText
        })
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? updatedMessage : msg
          )
        );
        setEditingMessageId(null);
        setEditingText('');
        setIsClick(true);
      } else if (response.status === 401) {
        if (await refreshToken()) {
          await editMessage(messageId, newText);
        }
      } else {
        alert("Ошибка при редактировании сообщения");
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert("Ошибка при редактировании сообщения");
    }
  };
  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/group-messages/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setIsClick(true)
      } else if (response.status === 403) {
        alert("Вы можете удалять только свои сообщения");
      } else if (response.status === 401) {
        if (await refreshToken()) {
          await deleteMessage(id);
        }
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
  const exitGroup = async (memberId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setGroupMembers(prev => prev.filter(member => member.id !== memberId));
        alert("Участник удален из группы");
        window.location.reload();
      } else {
        alert("Ошибка при удалении участника");
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert("Ошибка при удалении участника");
    }
  }

  const removeMember = async (memberId) => {
    if (!isAdmin) {
      alert("Только администратор может удалять участников");
      return;
    }
      try {
        const response = await fetch(`http://localhost:8080/api/groups/${groupId}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          setGroupMembers(prev => prev.filter(member => member.id !== memberId));
          alert("Участник удален из группы");
          window.location.reload();
        } else {
          alert("Ошибка при удалении участника");
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert("Ошибка при удалении участника");
      }
  }
  const getMembers = async () => {
    try {
      const response = await fetch(`${user_service}/api/users/all/ids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: usersIds
        }),
      });

      if (response.ok) {
        const members = await response.json();
        setGroupMembers(members);
      }
    } catch (error) {
      console.error('Ошибка при загрузке участников:', error);
    }
  }

  // Функция для начала редактирования
  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setIsClick(false);
  };

  // Функция для отмены редактирования
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
    setIsClick(true);
  };

  

  const click = (clicker, id) => {
    setIsClick(clicker)
    setDeleteId(id)
  }

  

  const sendToBackend = async (imageUrl) => {
        try {
            const response = await fetch("http://localhost:8080/api/groups/avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    groupId: groupId,
                    avatar: imageUrl
                }),
            });
            console.log(userId);
            console.log(imageUrl);
            alert("Ссылка отправлена на backend!");
        } catch (err) {
            console.error("Ошибка отправки:", err);
        }
    };
  
  const uploadImage = async () => {
        if (!image) return;
        console.log(image)

        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "main_preset"); // your unsigned preset
        data.append("cloud_name", "djrfj2vjf");

        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/djrfj2vjf/image/upload",
                {
                    method: "POST",
                    body: data,
                }
            );
            const file = await res.json();
            console.log(file.secure_url);
            setUrl(file.secure_url); // This is the uploaded image URL
            sendToBackend(file.secure_url);
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

  

  const closeMembersPopup = () => {
    setShowMembersPopup(false);
  }

  useEffect(() => {
    getMembers()
    if(creatorId === userId){
      setIsAdmin(true);
    }
    else{
      setIsAdmin(false);
    }
  }, [])

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info" onClick={() => setShowMembersPopup(true)}>
          <div className="chat-user-avatar">
            {groupAvatar != null ? (
              <img src={groupAvatar} alt="Group Avatar" />
            ) : (
              <span className="avatar-placeholder">👥</span>
            )}
          </div>
          <div className="chat-user-info">
            <h3 className="chat-username">{groupName}</h3>
            <p className="chat-status">Группа • {groupMembers.length} участников</p>
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
            <div className="empty-chat-icon">👥</div>
            <h3>Начните разговор в группе</h3>
            <p>Отправьте первое сообщение, чтобы начать общение в группе {groupName}</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className={`message-wrapper ${msg.senderId === userId ? 'my_message' : 'their_message'}`}
              >
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
                          disabled={!editingText.trim()}
                        >
                          💾
                        </button>
                        <button 
                          className="edit-cancel-btn"
                          onClick={cancelEditing}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Обычный режим отображения
                    <>
                      {msg.senderId !== userId && (
                        <div className="message-sender">
                          {msg.username  || `Пользователь ${msg.senderId}`}
                        </div>
                      )}
                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {msg.senderId === userId && (
                        <div className="message-status">
                          {msg.read ? '✓✓' : '✓'}
                        </div>
                      )}
                      {msg.senderId === userId && (
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
                            onClick={() => click(!isClick, msg.id)}
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
                    e.preventDefault();
                    if (inputText.trim()) {
                      sendMessage();
                    }
                  }
                }}
              />
              <button className="emoji-btn" title="Эмодзи" onClick={(e) => {e.preventDefault(); sendToBackend("https://res.cloudinary.com/djrfj2vjf/image/upload/v1755623535/patq56fzs6smnqxugejl.jpg");}}>
                <span className="emoji-icon">😊</span>
              </button>
            </div>
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!inputText.trim()}
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
                      if (editingText.trim()) {
                        editMessage(editingMessageId, editingText);
                      }
                    }
                  }}
                />
              </div>
              <div className="edit-panel-actions">
                <button 
                  className="save-btn" 
                  onClick={() => editMessage(editingMessageId, editingText)}
                  disabled={!editingText.trim()}
                >
                  💾 Сохранить
                </button>
                <button className="cancel-btn" onClick={cancelEditing}>
                  ❌ Отмена
                </button>
              </div>
            </div>
          ) : (
            // Панель удаления
            <>
              <button className="delete-btn" onClick={() => deleteMessage(deleteId)}>
                <span className="delete-icon">🗑️</span>
                Удалить сообщение
              </button>
              <button className="cancel-btn" onClick={() => setIsClick(true)}>
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
                  if (inputText.trim()) {
                    sendMessage();
                  }
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
            disabled={!inputText.trim()}
            title="Отправить"
          >
            <span className="send-icon">📤</span>
          </button>
        </div>
      )}

      {/* Выпадающее окно с участниками группы */}
      {showMembersPopup && (
        <div className="user-popup-overlay" onClick={closeMembersPopup}>
          <div className="user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="user-popup-header">
              <div className="user-popup-avatar">
                <div className="user-popup-avatar-placeholder">👥</div>
              </div>
              <div className="user-popup-info">
                <h3 className="user-popup-name">{groupName}</h3>
                <p className="user-popup-status">Участники группы</p>
              </div>
              <button className="user-popup-close" onClick={closeMembersPopup}>✕</button>
            </div>

            <div className="user-popup-content">
              <div className="members-list">
                <h4>Список участников ({groupMembers.length})</h4>
                {groupMembers.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" />
                        ) : (
                          <div className="member-avatar-placeholder">👤</div>
                        )}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{member.username}</span>
                        {member.id === userId && <span className="member-you">(Вы)</span>}
                      </div>
                    </div>
                    {isAdmin && member.id !== userId && (
                      <button 
                        className="remove-member-btn"
                        onClick={() => removeMember(member.id)}
                        title="Удалить участника"
                      >
                        🗑️
                      </button>
                    )}
                    
                  </div>
                ))}
                <button className="message-action-btn delete-btn" onClick={() => exitGroup(userId)}title="Выйти из группы">Выйти 🗑️</button>
                <input type="file" onChange={(e) => { e.preventDefault(); handleImageChange(e); }} />
                            <button
                                className="settings-btn-primary"
                                onClick={(e) => { e.preventDefault(); uploadImage(); }}
                            >Загрузить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChat;




