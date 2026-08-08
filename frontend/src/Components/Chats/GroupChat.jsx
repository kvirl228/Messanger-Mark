import { useEffect, useState, useRef } from "react";
import { auth_service,message_service, chat_service, user_service, file_service } from '../../properties';
import './Chat.css';
import { useUser } from "../context/UserContext";
import { useNavigate } from 'react-router-dom';
import WebSocketService from "../../Service/WebSocketService";

function GroupChat({ usersIds ,groupId, groupName,bio, groupAvatar, onExit }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate()
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isClick, setIsClick] = useState(true)
  const [deleteId, setDeleteId] = useState(0)
  const [image, setImage] = useState(null);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [url, setUrl] = useState('');
  const [userId, setUserId] = useState(user.userId);
  const [avatarPreview, setAvatarPreview] = useState(groupAvatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState('');
  const [groupDescriptionText, setGroupDescriptionText] = useState(bio || '');
  const [groupTitle, setGroupTitle] = useState(groupName || '');
  
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [creatorId, setCreatorId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      event.target.value = '';
      return;
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setImage(file);
    setAvatarPreview(URL.createObjectURL(file));
    setUploadFeedback('');
  };

  function mergeMessagesWithUsers(messages, users, currentUserId) {
    
    const usersMap = new Map();

    users.forEach(user => {
        usersMap.set(Number(user.id), user);
    });

    return messages.map(message => {

        const senderId = Number(message.senderid);

        // Если сообщение моё
        if (senderId === Number(currentUserId)) {
            return {
                ...message,
                username: null
            };
        }

        // Если сообщение чужое
        const user = usersMap.get(senderId);

        return {
            ...message,
            username: user ? user.username : ""
        };
    });
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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      event.target.value = "";
      return;
    }

    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
    }

    setPendingAttachment(file);
    setPendingPreview(URL.createObjectURL(file));
    setInputText("");
    event.target.value = "";
  };

  const clearPendingAttachment = () => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
    }
    setPendingAttachment(null);
    setPendingPreview(null);
  };

  const openImagePreview = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  const sendImageMessage = async (imageUrl) => {
    const payload = {
      chatId: groupId,
      text: imageUrl,
      type: "img"
    };

    WebSocketService.send("/app/chat.send", payload);
  };

  const sendPendingAttachment = async () => {
    if (!pendingAttachment) return;

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", pendingAttachment);

      const response = await fetch(`${file_service}/api/files/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки файла");
      }

      const fileData = await response.json();
      await sendImageMessage(fileData.url);
      clearPendingAttachment();
    } catch (error) {
      console.error("Ошибка отправки фото:", error);
      alert("Не удалось отправить фотографию");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;
    console.log(groupId);
     WebSocketService.send("/app/chat.send", {
        chatId: groupId,
        text: inputText,
        type:"text"
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
  const exitGroup = async () => {
    try {
      const response = await fetch(`${chat_service}/api/chats/${groupId}/exit/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        onExit(); // Вызов функции обратного вызова для выхода из группы
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
        const response = await fetch(`${chat_service}/api/chats/delete/${groupId}/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          setGroupMembers(prev => prev.filter(member => member.id !== memberId));
          alert("Участник удален из группы");
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
            return members;
        }

        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
  };

  const fetchContacts = async () => {
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
        const allContacts = Array.isArray(data) ? data : [data];
        const normalized = allContacts.map(contact => ({
          ...contact,
          id: contact.id ?? contact.contactId
        }));
        setContacts(normalized);
        return normalized;
      }
    } catch (error) {
      console.error('Ошибка при получении контактов:', error);
    }
    return [];
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const addContactsToGroup = async () => {
    if (!isAdmin || selectedContactIds.length === 0) return;

    try {
      const response = await fetch(`${chat_service}/api/chats/${groupId}/members/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberIds: selectedContactIds })
      });

      if (response.ok) {
        const addedMembers = contacts.filter(contact => selectedContactIds.includes(contact.id));
        setGroupMembers(prev => [...prev, ...addedMembers]);
        setSelectedContactIds([]);
        alert('Участники добавлены');
      } else {
        alert('Не удалось добавить участников');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при добавлении участников');
    }
  };

  const handleContactSearch = (event) => {
    setContactSearchQuery(event.target.value);
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
    const candidateEndpoints = [
      `${chat_service}/api/chats/avatar`,
      `${chat_service}/api/chats/${groupId}/avatar`,
      `${chat_service}/api/chats/group/avatar`,
      `${chat_service}/api/chats/update/avatar`,
      `${chat_service}/api/chats/${groupId}/update-avatar`,
      `${chat_service}/api/chats/${groupId}/update/avatar`
    ];

    const payloads = [
      { groupId, avatar: imageUrl },
      { id: userId, groupId, avatar: imageUrl },
      { chatId: groupId, avatar: imageUrl },
      { id: groupId, avatar: imageUrl }
    ];

    for (const endpoint of candidateEndpoints) {
      for (const payload of payloads) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            setUrl(imageUrl);
            setAvatarPreview(imageUrl);
            setUploadFeedback("Аватарка успешно обновлена");
            return true;
          }
        } catch (err) {
          console.error(`Ошибка запроса к ${endpoint}:`, err);
        }
      }
    }

    setUploadFeedback("Не удалось сохранить аватарку");
    return false;
  };
  
  const uploadImage = async () => {
    if (!image) {
      setUploadFeedback("Сначала выберите изображение");
      return;
    }

    setUploadingAvatar(true);
    setUploadFeedback('');

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(`${file_service}/api/files/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки файла");
      }

      const fileData = await response.json();
      setUrl(fileData.url);
      await sendToBackend(fileData.url);
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
    setAvatarPreview(groupAvatar || null);
  }, [groupAvatar]);

  useEffect(() => {
    getCreatorId()
    // console.log('GroupChat mounted with props:', { usersIds, groupId, groupName, bio, groupAvatar, creatorId });
    const loadData = async () => {
        const members = await getMembers();
        const messages = await getMessages();
        await fetchContacts();

        setGroupMembers(members);
        setMessages(mergeMessagesWithUsers(messages, members, userId));
    };

    loadData();
    
   
    const listener = (message) => {
      // if (message.chatId === groupId) {
      //   setMessages(prevMessages => [...prevMessages, message]);
      // }
      if (message.responseType === "DELETE") {
          setMessages(prev => prev.filter(m => m.id !== message.messageId));
        return;
      }
      if (message.responseType === "EDIT") {
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
      if (message.responseType === "MESSAGE") {
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
      {/* <button onClick={() => console.log(messages)}>show</button> */}
      <div className="chat-header">
        <div className="chat-header-info" onClick={() => setShowMembersPopup(true)}>
          <div className="chat-user-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Group Avatar" />
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
            {messages.map((msg, index) => {
              const messageType = String(msg?.type || 'text').toLowerCase();
              const imageUrl = messageType === 'img'
                ? (msg?.text || msg?.img || msg?.imageUrl || msg?.image || msg?.fileUrl || msg?.url || null)
                : null;
              const textContent = messageType === 'text' ? (msg?.text ?? '') : '';

              return (
              <div
                key={`${msg.sendtime}-${index}`}
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
                          {msg.username }
                        </div>
                      )}
                      {imageUrl ? (
                        <div className="message-image-wrapper" onClick={() => openImagePreview(imageUrl)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImagePreview(imageUrl); } }}>
                          <img src={imageUrl} alt="Attachment" className="message-image" />
                        </div>
                      ) : (
                        <div className="message-content">{textContent}</div>
                      )}
                      <div className="message-time">
                        {new Date(msg.sendtime).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {msg.senderId === userId && (
                        <div className="message-status">
                          {msg.read ? '✓✓' : '✓'}
                        </div>
                      )}
                      {msg.senderid === userId && (
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
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="image-preview-overlay" onClick={closeImagePreview}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-preview-close" onClick={closeImagePreview} title="Закрыть">✕</button>
            <img src={selectedImage} alt="Full preview" className="image-preview-full" />
          </div>
        </div>
      )}

      {isClick ? (
        pendingAttachment ? (
          <div className="chat-input-panel">
            <div className="attachment-preview-panel">
              <div className="attachment-preview-card">
                {pendingPreview && <img src={pendingPreview} alt="preview" className="attachment-preview-image" />}
                <div className="attachment-preview-info">
                  <div className="attachment-preview-name">{pendingAttachment.name}</div>
                  <div className="attachment-preview-hint">Фото готово к отправке</div>
                </div>
              </div>
              <div className="attachment-preview-actions">
                <button className="cancel-btn" onClick={clearPendingAttachment}>
                  ✕ Отмена
                </button>
                <button
                  className="send-btn"
                  onClick={sendPendingAttachment}
                  disabled={isUploadingImage}
                  title="Отправить фото"
                >
                  {isUploadingImage ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-input-panel">
            <div className="input-container">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAttachmentChange}
              />
              <button
                className="attachment-btn"
                title="Прикрепить файл"
                onClick={handleAttachmentClick}
                disabled={isUploadingImage}
              >
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
        )
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
                {isAdmin ? (
                  <p className="group-description-card__text group-description-card__text--editable">
                    {groupDescriptionText?.trim() ? groupDescriptionText : 'Описание пока не добавлено'}
                  </p>
                ) : (
                  <p className="group-description-card__text">
                    {groupDescriptionText?.trim() ? groupDescriptionText : 'Описание пока не добавлено'}
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="group-contacts-section">
                  <div className="group-contacts-header">
                    <h4>Добавить участника</h4>
                    <span className="group-contacts-sub">Из контактов</span>
                  </div>
                  <div className="contacts-search-container">
                    <input
                      className="contacts-search-input"
                      value={contactSearchQuery}
                      onChange={handleContactSearch}
                      placeholder="Поиск контактов..."
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  <div className="group-contacts-list">
                    {contacts.filter(contact =>
                      contact.username.toLowerCase().includes(contactSearchQuery.toLowerCase()) &&
                      !groupMembers.some(member => member.userId === contact.userId)
                    ).map(contact => (
                      <div
                        key={contact.id}
                        className={`group-contact-item ${selectedContactIds.includes(contact.id) ? 'selected' : ''}`}
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <div className="group-contact-info">
                          <div className="group-contact-avatar">
                            {groupAvatar ? (
                              <img src={groupAvatar} alt="Avatar" />
                            ) : (
                              <span className="member-avatar-placeholder">👤</span>
                            )}
                          </div>
                          <div>
                            <div className="group-contact-name">{contact.username}</div>
                            <div className="group-contact-status">
                              {contact.online ? '🟢 В сети' : '⚪ Не в сети'}
                            </div>
                          </div>
                        </div>
                        <div className="group-contact-checkbox">
                          {selectedContactIds.includes(contact.id) ? '✓' : ''}
                        </div>
                      </div>
                    ))}
                    {contacts.filter(contact =>
                      contact.username.toLowerCase().includes(contactSearchQuery.toLowerCase()) &&
                      !groupMembers.some(member => member.id === contact.id)
                    ).length === 0 && (
                      <div className="group-contacts-empty">Нету доступных контактов для добавления</div>
                    )}
                  </div>
                  <button
                    className="group-add-btn"
                    onClick={addContactsToGroup}
                    disabled={selectedContactIds.length === 0}
                  >
                    Добавить в группу ({selectedContactIds.length})
                  </button>
                </div>
              )}

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
                    {console.log(member)}
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




