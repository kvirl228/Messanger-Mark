import { useEffect, useState, useRef, useMemo } from "react";
import { auth_service, user_service, chat_service, message_service, file_service } from "../../properties"
import './Chat.css';

import { useUser } from "../context/UserContext";
import WebSocketService from "../../Service/WebSocketService";

function Chat({ chatid, user2Id, username ,bio, img, contact, type}) {

  const { user, setUser } = useUser();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClick, setIsClick] = useState(true)
  const [chatId, setChatId] = useState(chatid);
  const [deleteId, setDeleteId] = useState(0)
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isContact, setIsContact] = useState(contact);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setIsClick(true); // Закрываем панель удаления при редактировании
  }

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
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

  const checkOnlineStatus = async () => {
    try {
      const response = await fetch(`${message_service}/api/messages/online/${user2Id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        console.log('Пользователь онлайн');
        setOnlineStatus(true);
      }
    } catch (error) {
      console.error('Ошибка при проверке статуса онлайн:', error);
    }
  }

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    console.log(WebSocketService.connected);
    // Первый диалог
    if (chatId == null) {
        WebSocketService.send("/app/chat.start", {
            recipientId: user2Id,
            text: inputText,
            type: "TEXT"
        });
    }
    // Обычное сообщение
    else {

        WebSocketService.send("/app/chat.send", {
            chatId: chatId,
            text: inputText,
            type: "TEXT"
        });
        scrollToBottom();

    }

    setInputText("");

  };

  const sendImageMessage = async (imageUrl) => {
    console.log("Sending image message:", imageUrl);
    const payload = {
        chatId: chatId,
        text: imageUrl,
        type: "img",
    };


    if (chatId == null) {

        WebSocketService.send("/app/chat.start", {
            recipientId: user2Id,
            text: imageUrl,
            type: "img"
        });

    } else {

        WebSocketService.send(
            "/app/chat.send",
            payload
        );

    }

    scrollToBottom();
  };

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
        const normalizedMessages = (Array.isArray(data) ? data : [data]).map((msg) => ({
          ...msg,
          type: String(msg?.type || "text").toLowerCase()
        }));
        setMessages(normalizedMessages);
        console.log("MESSAGES:", normalizedMessages);
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
          contactId: user2Id,
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
    checkOnlineStatus();
    scrollToBottom();
    const listener = (message) => {
      console.log("Received message:", message);
      const normalizedMessage = {
        ...message,
        type: String(message?.type || message?.responseType || "text").toLowerCase()
      };

      if (normalizedMessage.responseType === "DELETE") {
          setMessages(prev => prev.filter(m => m.id !== normalizedMessage.messageId));
        return;
      }
      if (normalizedMessage.responseType === "EDIT") {
        console.log("Editing message:", normalizedMessage.id, normalizedMessage.text);
        setMessages(prev =>
            prev.map(m =>
                m.id === normalizedMessage.id
                    ? normalizedMessage
                    : m
            )
        );
        return;
      }
      if (normalizedMessage.responseType === "MESSAGE") {
        if (normalizedMessage.chatId !== chatId && chatId !== null) {
          return;
        }
        setMessages(prev => [...prev, normalizedMessage]);
      }
      if(normalizedMessage.responseType === "PRIVATE"){
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

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(msg => {
      const text = String(msg.text ?? msg.message ?? msg.body ?? '');
      return text.toLowerCase().includes(q);
    });
  }, [messages, searchQuery]);

  const displayedMessages = searchMode ? filteredMessages : messages;

  const formatDateLabel = (inputDate) => {
    const msgDate = new Date(inputDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMsg = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
    const daysDiff = Math.round((startOfMsg - startOfToday) / 86400000);

    if (daysDiff === 0) return 'Сегодня';
    if (daysDiff === -1) return 'Вчера';
    const opts = { day: 'numeric', month: 'long' };
    if (msgDate.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
    return msgDate.toLocaleDateString('ru-RU', opts);
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        {/* <button onClick={() => console.log(messages )}>show</button> */}
        <div className="chat-header-info" onClick={handleUsernameClick}>
          <div className="chat-user-avatar">
            {img != null ? (
              <img src={img} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
            <div className="online-indicator">
              {onlineStatus ? '🟢' : '⚪'}
            </div>
          </div>
          <div className="chat-user-info">
            <h3 className="chat-username">{username}</h3>
            <p className="chat-status">
              {onlineStatus ? 'В сети' : 'Не в сети'}
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            className="chat-action-btn"
            title="Поиск"
            onClick={() => {
              setSearchMode(prev => !prev);
              if (searchMode) setSearchQuery('');
            }}
          >
            <span className="action-icon">🔍</span>
          </button>
          <button className="chat-action-btn" title="Настройки">
            <span className="action-icon">⚙️</span>
          </button>
        </div>
      </div>

      {searchMode && (
        <div className="chat-search-row">
          <input
            className="chat-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по сообщениям..."
          />
          <button
            className="chat-search-close"
            type="button"
            onClick={() => {
              setSearchMode(false);
              setSearchQuery('');
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="messages-container">
        {displayedMessages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <h3>{searchMode && searchQuery ? 'Сообщения не найдены' : 'Начните разговор'}</h3>
            <p>
              {searchMode && searchQuery
                ? 'Попробуйте другой запрос'
                : `Отправьте первое сообщение, чтобы начать общение с ${username}`}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {(() => {
              const elements = [];
              let lastDateStr = null;
              for (let i = 0; i < displayedMessages.length; i++) {
                const msg = displayedMessages[i];
                const rawTime = msg.sendtime ?? msg.timestamp ?? msg.createdAt ?? msg.sendTime;
                const msgDate = new Date(rawTime);
                const dayStr = isNaN(msgDate.getTime()) ? `unknown-${i}` : msgDate.toDateString();
                if (dayStr !== lastDateStr) {
                  elements.push(
                    <div key={`date-${dayStr}-${i}`} className="date-separator">
                      <span className="date-separator-text">{isNaN(msgDate.getTime()) ? 'Неизвестная дата' : formatDateLabel(msgDate)}</span>
                    </div>
                  );
                  lastDateStr = dayStr;
                }

                const key = msg.id ?? rawTime ?? i;
                const messageType = String(msg?.type || 'text').toLowerCase();
                const imageUrl = messageType === 'img'
                  ? (msg?.text || msg?.img || msg?.imageUrl || msg?.image || msg?.fileUrl || msg?.url || null)
                  : null;
                const textContent = messageType === 'text' ? (msg?.text ?? '') : '';

                elements.push(
                  <div key={`${key}-${i}`} className={`message-wrapper ${msg.senderid === user.userId ? 'my_message' : 'their_message'}`}>
                    <div className="message-bubble">
                      {editingMessageId === msg.id ? (
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
                        <>
                          {imageUrl ? (
                            <div className="message-image-wrapper" onClick={() => openImagePreview(imageUrl)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImagePreview(imageUrl); } }}>
                              <img src={imageUrl} alt="Attachment" className="message-image" />
                            </div>
                          ) : (
                            <div className="message-content">{textContent}</div>
                          )}
                          <div className="message-time">{
                            new Date(rawTime).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {msg.senderId === user.userid && (
                            <div className="message-status">
                              {msg.userid}
                            </div>
                          )}
                          {msg.senderid === user.userId && (
                            <div className="message-actions">
                              <button 
                                className="message-action-btn edit-btn"
                                onClick={() => startEditing(msg.id, msg.text)}
                                title="Редактировать"
                              >
                                ✏️
                              </button>
                              <button 
                                className="message-action-btn delete-btn"
                                onClick={deleteMessage.bind(null, msg.id)}
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
              }
              return elements;
            })()}
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
                      sendMessage();
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
                  sendMessage();
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
                {img ? (
                  <img src={img} alt="Avatar" />
                ) : (
                  <div className="user-popup-avatar-placeholder">👤</div>
                )}
              </div>
              <div className="user-popup-info">
                <h3 className="user-popup-name">{userInfo?.username || username}</h3>
                <p className="user-popup-status">
                  {onlineStatus ? '🟢 В сети' : '⚪ Не в сети'}
                </p>
              </div>
              <button className="user-popup-close" onClick={closeUserPopup}>✕</button>
            </div>

            <div className="user-popup-content">
              {userInfo.bio && (
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