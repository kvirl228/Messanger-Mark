import { useEffect, useState } from "react";
import "./Chat.css";

function ChannelChat({ userId, channelId, channelName, channelAvatar , ownerId}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [channelMembers, setChannelMembers] = useState([]);
  const [image, setImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [url, setUrl] = useState('');
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem("token", token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const subscribe = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/channel-messages/channel/${channelId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages([]);
        setMessages((prevMessages) => [...prevMessages, ...data]);
        setTimeout(() => {
          subscribe();
        }, 1500);
      } else if (response.status === 401) {
        if (await refreshToken()) {
          return await subscribe();
        }
      }
    } catch (error) {
      setTimeout(() => {
        subscribe();
      }, 1);
    }
  };

  const sendMessage = async () => {
    if (!isAdmin) {
      alert("Только администратор канала может отправлять сообщения");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/channel-messages/send/${channelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: inputText,
            senderId: userId,
          }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        const newMessage = [...messages, message];
        setMessages(newMessage);
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }

    setInputText("");
  };

  const editMessage = async (messageId, newText) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/channel-messages/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: newText,
          }),
        }
      );

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? updatedMessage : msg
          )
        );
        setEditingMessageId(null);
        setEditingText("");
      } else if (response.status === 401) {
        if (await refreshToken()) {
          await editMessage(messageId, newText);
        }
      } else {
        alert("Ошибка при редактировании сообщения");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при редактировании сообщения");
    }
  };


  const exitGroup = async (memberId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/channel/${channelId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setChannelMembers(prev => prev.filter(member => member.id !== memberId));
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

  // Функция для начала редактирования
  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  // Функция для отмены редактирования
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/channel-messages/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        subscribe();
      } else if (response.status === 403) {
        alert("Вы можете удалять только свои сообщения");
      } else if (response.status === 401) {
        if (await refreshToken()) {
          await deleteMessage(id);
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const getMembers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/channel/${channelId}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const members = await response.json();
        setChannelMembers(members);
      }
    } catch (error) {
      console.error("Ошибка при загрузке участников:", error);
    }
  };

  const sendToBackend = async (imageUrl) => {
    try {
      const response = await fetch("http://localhost:8080/api/channel/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          channelId: channelId,
          avatar: imageUrl,
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

  const removeMember = async (memberId) => {
    if (!isAdmin) {
      alert("Только администратор канала может удалять участников");
      return;
    }


    try {
      const response = await fetch(
        `http://localhost:8080/api/channel/${channelId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setChannelMembers((prev) =>
          prev.filter((member) => member.id !== memberId)
        );
        alert("Участник удален из канала");
      } else {
        alert("Ошибка при удалении участника");
        console.log(response);
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при удалении участника 2");
    }
  };

  const closeMembersPopup = () => {
    setShowMembersPopup(false);
  };

  useEffect(() => {
    subscribe();
    getMembers();
    if(ownerId === userId){
      setIsAdmin(true);
    }
    else{
      setIsAdmin(false)
    }
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div
          className="chat-header-info"
          onClick={() => setShowMembersPopup(true)}
        >
          <div className="chat-user-avatar">
            {channelAvatar != null ? (
              <img src={channelAvatar} alt="Channel Avatar" />
            ) : (
              <span className="avatar-placeholder">📢</span>
            )}
          </div>
          <div className="chat-user-info">
            <h3 className="chat-username">{channelName}</h3>
            <p className="chat-status">
              Канал • {channelMembers.length} участников
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
            <div className="empty-chat-icon">📢</div>
            <h3>Канал пуст</h3>
            <p>Администратор канала еще не отправил сообщений</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className={`message-wrapper ${
                  msg.senderId === userId ? "my_message" : "their_message"
                }`}
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
                      <div className="message-sender">
                        {channelName || `Администратор ${msg.senderId}`}
                      </div>

                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {msg.senderId === userId && isAdmin && (
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
                            onClick={() => deleteMessage(msg.id)}
                            title="Удалить"
                          >
                            🗑
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

      {isAdmin ? (
        <div className="chat-input-panel">
          <div className="input-container">
            <button className="attachment-btn" title="Прикрепить файл">
              <span className="attachment-icon">📎</span>
            </button>
            <div className="input-wrapper">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Введите сообщение (только для администраторов)..."
                className="chat-input"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) {
                      sendMessage();
                    }
                  }
                }}
              />
              <button
                className="emoji-btn"
                title="Эмодзи"
                onClick={(e) => {
                  e.preventDefault();
                  sendToBackend(
                    "https://res.cloudinary.com/djrfj2vjf/image/upload/v1755623535/patq56fzs6smnqxugejl.jpg"
                  );
                }}
              >
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
        <></>
      )}

      {/* Выпадающее окно с участниками канала */}
      {showMembersPopup && (
        <div className="user-popup-overlay" onClick={closeMembersPopup}>
          <div className="user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="user-popup-header">
              <div className="user-popup-avatar">
                <div className="user-popup-avatar-placeholder">📢</div>
              </div>
              <div className="user-popup-info">
                <h3 className="user-popup-name">{channelName}</h3>
                <p className="user-popup-status">Участники канала</p>
              </div>
              <button className="user-popup-close" onClick={closeMembersPopup}>
                ✕
              </button>
            </div>


            <div className="user-popup-content">
              <div className="members-list">
                <h4>Список участников ({channelMembers.length})</h4>
                {channelMembers.map((member) => (
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
                        {member.id === userId && (
                          <span className="member-you">(Вы)</span>
                        )}
                      </div>
                    </div>
                    {isAdmin && member.id !== userId && (
                      <button
                        className="remove-member-btn"
                        onClick={() => removeMember(member.id)}
                        title="Удалить участника"
                      >
                        🗑
                      </button>
                    )}

                  </div>
                ))}
                <button className="message-action-btn delete-btn" onClick={() => exitGroup(userId)}title="Выйти из группы">Выйти 🗑</button>
                {isAdmin  ? (<>
                  <input type="file" onChange={(e) => { e.preventDefault(); handleImageChange(e); }} />
                          <button
                              className="settings-btn-primary"
                              onClick={(e) => { e.preventDefault(); uploadImage(); }}
                          >Загрузить</button>
                </>)

                :(

                <></>
                              
                )}
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default ChannelChat;
