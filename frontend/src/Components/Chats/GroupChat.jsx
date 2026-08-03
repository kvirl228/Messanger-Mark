import { useEffect, useState, useMemo } from "react";
import { auth_service,message_service, chat_service, user_service } from '../../properties';
import './Chat.css';
import { useUser } from "../context/UserContext";
import WebSocketService from "../../Service/WebSocketService";

function GroupChat({ usersIds ,groupId, groupName,bio, groupAvatar }) {
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
  const [avatarPreview, setAvatarPreview] = useState(groupAvatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState('');
  
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [creatorId, setCreatorId] = useState(null);
  

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImage(file);
    setAvatarPreview(URL.createObjectURL(file));
    setUploadFeedback('');
  };

  function mergeMessagesWithUsers(messages, users) {
    const usersMap = new Map(
        users.map(user => [user.id, user])
    );

    return messages.map(message => ({
        ...message,
        username: usersMap.get(message.senderid)?.username ?? "Неизвестный",
        avatar: usersMap.get(message.senderid)?.avatar ?? null,
        bio: usersMap.get(message.senderid)?.bio ?? ""
    }));
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
      return false
    } catch (error) {
      return false
    }
  }

  const sendMessage = async () => {
    if (inputText.trim() === "") return;
    console.log(groupId);
     WebSocketService.send("/app/chat.send", {
        chatId: groupId,
        text: inputText
      });
    setInputText('')
  }

  // Функция для редактирования сообщения
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
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ids: usersIds
            })
        });

        if (response.ok) {
            const members = await response.json();
            setGroupMembers(members);
            return members;          // ← добавить
        }

        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
  };
  const getMessages = async () => {
    try {
        const response = await fetch(`${message_service}/api/messages/all/${groupId}`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
          }});
        if (response.ok) {
            const data = await response.json();
            const messages = Array.isArray(data) ? data : [data];
            return messages;      // ← вернуть
        }
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
  };

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

  const getCreatorId = async () => {
    try {
      const response = await fetch(`${chat_service}/api/chats/owner/${groupId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const groupData = await response.json();
        setCreatorId(groupData.ownerId)
         if(groupData.ownerId === userId){
          setIsAdmin(true);
        }
        else{
          setIsAdmin(false);
        }
      } else {
        console.error("Ошибка при получении данных группы");
      }
    } catch (error) {
      console.error("Ошибка при получении данных группы:", error);
    }
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

      if (response.ok) {
        setUrl(imageUrl);
        setAvatarPreview(imageUrl);
        setUploadFeedback("Аватарка успешно обновлена");
      } else {
        setUploadFeedback("Не удалось сохранить аватарку");
      }
    } catch (err) {
      console.error("Ошибка отправки:", err);
      setUploadFeedback("Ошибка при обновлении аватарки");
    }
  };
  
  const uploadImage = async () => {
    if (!image) {
      setUploadFeedback("Сначала выберите изображение");
      return;
    }

    setUploadingAvatar(true);
    setUploadFeedback('');

    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "main_preset");
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
      setUrl(file.secure_url);
      await sendToBackend(file.secure_url);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadFeedback("Ошибка загрузки изображения");
    } finally {
      setUploadingAvatar(false);
    }
  };

  

  const closeMembersPopup = () => {
    setShowMembersPopup(false);
  }

  useEffect(() => {
    getCreatorId()
    // console.log('GroupChat mounted with props:', { usersIds, groupId, groupName, bio, groupAvatar, creatorId });
    const loadData = async () => {
        const members = await getMembers();
        const messages = await getMessages();

        setGroupMembers(members);
        setMessages(mergeMessagesWithUsers(messages, members));
    };

    loadData();
    
   
    const listener = (message) => {
      // if (message.chatId === groupId) {
      //   setMessages(prevMessages => [...prevMessages, message]);
      // }
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
        if (message.chatId !== groupId && groupId !== null) {
          return;
        }
        setMessages(prev => [...prev, message]);
      }
    };

    WebSocketService.addListener(listener);
    
    return () => {WebSocketService.removeListener(listener);};
  }, [])

  return (
    <div className="chat-container">
      {/* <button onClick={() => console.log(isAdmin)}>show</button> */}
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
                className={`message-wrapper ${msg.senderid === userId ? 'my_message' : 'their_message'}`}
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
                          // disabled={!editingText.trim()}
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
                          {msg.username  }
                        </div>
                      )}
                      <div className="message-content">{msg.text}</div>
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
                      {msg.senderId !== userId && (
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
                    sendMessage()
                    // if (inputText.trim()) {
                    //   sendMessage();
                    // }
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
                  // onKeyPress={(e) => {
                  //   if (e.key === 'Enter' && !e.shiftKey) {
                  //     e.preventDefault();
                  //     if (editingText.trim()) {
                  //       editMessage(editingMessageId, editingText);
                  //     }
                  //   }
                  // }}
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
              // onKeyPress={(e) => {
              //   if (e.key === 'Enter' && !e.shiftKey) {
              //     e.preventDefault();
              //     if (inputText.trim()) {
              //       sendMessage();
              //     }
              //   }
              // }}
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
      )}

      {/* Выпадающее окно с участниками группы */}
      {showMembersPopup && (
        <div className="group-user-popup-overlay" onClick={closeMembersPopup}>
          <div className="group-user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="group-user-popup-header">
              <div className="group-user-popup-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Group avatar" />
                ) : (
                  <div className="group-user-popup-avatar-placeholder">👥</div>
                )}
              </div>
              <div className="group-user-popup-info">
                <h3 className="group-user-popup-name">{groupName}</h3>
                <p className="group-user-popup-status">{groupMembers.length} участников • управление группой</p>
              </div>
              <button className="group-user-popup-close" onClick={closeMembersPopup}>✕</button>
            </div>

            <div className="group-user-popup-content">
              <div className="group-description-card">
                <div className="group-description-card__title">Описание группы</div>
                <p className="group-description-card__text">
                  {bio?.trim() ? bio : 'Описание пока не добавлено'}
                </p>
              </div>

              <div className="avatar-upload-card">
                <div className="avatar-upload-card__header">
                  <div>
                    <h4>Обновить аватарку</h4>
                    <p>Выберите новое фото для группы</p>
                  </div>
                  <div className="avatar-upload-preview">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" />
                    ) : (
                      <span>👥</span>
                    )}
                  </div>
                </div>

                <label className="avatar-upload-label" htmlFor="group-avatar-input">
                  <span className="avatar-upload-label__icon">📷</span>
                  <span>{image ? image.name : 'Выбрать изображение'}</span>
                </label>
                <input
                  id="group-avatar-input"
                  className="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <button
                  className="avatar-upload-btn"
                  onClick={uploadImage}
                  disabled={uploadingAvatar || !image}
                >
                  {uploadingAvatar ? 'Загрузка...' : 'Загрузить аватарку'}
                </button>
                {uploadFeedback && <p className="upload-feedback">{uploadFeedback}</p>}
              </div>

              <div className="members-list">
                <div className="members-list-header">
                  <h4>Участники ({groupMembers.length})</h4>
                </div>
                {groupMembers.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" />
                        ) : (
                          <span className="member-avatar-placeholder">👤</span>
                        )}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{member.username}</span>
                        {member.id === userId && <span className="member-you">(Вы)</span>}
                      </div>
                    </div>
                    {isAdmin && member.id == userId && (
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

                <button className="member-action-btn member-exit-btn" onClick={() => exitGroup(userId)}>
                  Выйти из группы
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChat;




