import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
// import { Cloudinary } from '@cloudinary/url-gen';
// import { auto } from '@cloudinary/url-gen/actions/resize';
// import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
// import { AdvancedImage } from '@cloudinary/react';

import './Forms.css'
import { auth_service, user_service } from "../../properties"

function Settings(props) {

    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [url, setUrl] = useState('');
    const [userid, setuserId] = useState(-1)
    const [userChats, setUserChats] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [image, setImage] = useState(null);



    const [user, setUser] = useState([])
    const navigate = useNavigate()

    const handleChangeName = (event) => {
        setName(event.target.value)
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value)
    }

    const handleChangeNewPassword = (event) => {
        setNewPassword(event.target.value)
    }

    const handleChangeConfirmPassword = (event) => {
        setConfirmPassword(event.target.value)
    }

    // const cld = new Cloudinary({ cloud: { cloudName: 'djrfj2vjf' } });

    //   // Use this sample image or upload your own via the Media Explorer
    //     const img = cld
    //             .image('cld-sample-5')
    //             .format('auto') // Optimize delivery by resizing and applying auto-format and auto-quality
    //             .quality('auto')
    //             .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio



    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
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
    
    const sendToBackend = async (imageUrl) => {
        try {
            const response = await fetch("http://localhost:8080/api/users/avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userid,
                    avatar: imageUrl
                }),
            });
            console.log(userid);
            console.log(imageUrl);
            alert("Ссылка отправлена на backend!");
        } catch (err) {
            console.error("Ошибка отправки:", err);
        }
    };

    const togglePasswordVisibility = (field) => {
        switch (field) {
            case 'current':
                setShowPassword(!showPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
        }
    }

    async function refresh() {
        try {
            const response = await fetch(`${auth_service}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
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
            const response = await fetch(`${user_service}/api/users/userid/${localStorage.getItem("token")}`, {
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

    const getCurrentUser = async (id) => {
        try {
            const response = await fetch(`${user_service}/api/users/id/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
                setName(data.username || '');
                console.log(data)
            } else if (response.status === 401) {
                if (await refresh()) {
                    await getCurrentUser();
                }
            }
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
        }
    }

    async function changeUsername() {
        if (!name.trim()) {
            alert('Пожалуйста, введите новое имя пользователя');
            return;
        }

        setIsLoading(true);

        try {
            console.log("id пользователя:",userid)
            const response = await fetch(`${user_service}/api/users/change/username`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                     username: name,
                     id: String(userid)
                    }),
            });

            if (response.ok) {
                await refresh()
                alert("Имя пользователя успешно изменено! 🎉")
                await getCurrentUser();
            }
            else {
                alert("Ошибка при изменении имени пользователя")
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert("Ошибка при изменении имени пользователя")
        } finally {
            setIsLoading(false);
        }
    }

    async function changePassword() {
        if (!password.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Новые пароли не совпадают');
            return;
        }

        if (newPassword.length < 6) {
            alert('Новый пароль должен содержать минимум 6 символов');
            return;
        }

        setIsLoading(true);

        try {
            console.log(password, newPassword, userid)
            const response = await fetch(`${auth_service}/auth/change/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    oldPassword: password,
                    newPassword: newPassword,
                    id: String(userid)
                }),
            });

            if (response.ok) {
                const response = await fetch(`${auth_service}/auth/logout`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                
                });
                localStorage.clear()
                alert("Пароль успешно изменен! 🔐")
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigate('/')
            }
            else {
                alert("Ошибка при изменении пароля")
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert("Ошибка при изменении пароля")
        } finally {
            setIsLoading(false);
        }
    }
    async function exit() {
        const response = await fetch(`${auth_service}/auth/logout`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
                
        });
        localStorage.clear()
        navigate('/')
    }
    useEffect(() => {
        const init = async () => {
            const id = await getUserId()
            await getCurrentUser(id)
        }
        init()
    }, [])

    function toChats() {
        navigate('/chats')
    }

    return (
        <div className="forms_block_settings">
            <div className="settings-form-container">
                <div className="settings-form-header">
                    <button className="settings-form-close" onClick={toChats}>
                        <span className="close-icon">✕</span>
                    </button>
                    <div className="settings-form-title">
                        <div className="settings-form-icon">⚙️</div>
                        <h1>Настройки профиля</h1>
                    </div>
                    <p className="settings-form-subtitle">Измените свои личные данные и настройки безопасности</p>
                </div>

                <div className="settings-form-content">
                    {/* Секция изменения имени */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-icon">👤</span>
                            <h2>Изменить имя пользователя</h2>
                        </div>
                        <div className="section-content">
                            <div className="input-group">
                                <label className="settings-label">
                                    <span className="label-icon">📝</span>
                                    Новое имя пользователя
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        className="settings-input"
                                        value={name}
                                        onChange={handleChangeName}
                                        placeholder="Введите новое имя пользователя"
                                        maxLength={30}
                                    />
                                    <div className="input-counter">{name.length}/30</div>
                                </div>
                            </div>
                            <button
                                className="settings-btn-primary"
                                onClick={(e) => { e.preventDefault(); changeUsername(); }}
                                disabled={isLoading || !name.trim() || name === currentUser?.username}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Изменение...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">✨</span>
                                        Изменить имя
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-icon">👤</span>
                            <h2>Изменить аватар</h2>
                        </div>
                        <div className="section-content">
                            <input type="file" onChange={(e) => { e.preventDefault(); handleImageChange(e); }} />
                            <button
                                className="settings-btn-primary"
                                onClick={(e) => { e.preventDefault(); uploadImage(); }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Изменение...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">✨</span>
                                        Изменить аватар
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Секция изменения пароля */}
                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-icon">🔐</span>
                            <h2>Изменить пароль</h2>
                        </div>
                        <div className="section-content">
                            <div className="input-group">
                                <label className="settings-label">
                                    <span className="label-icon">🔑</span>
                                    Текущий пароль
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        className="settings-input"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handleChangePassword}
                                        placeholder="Введите текущий пароль"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        <span className="password-icon">
                                            {showPassword ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="settings-label">
                                    <span className="label-icon">🆕</span>
                                    Новый пароль
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        className="settings-input"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={handleChangeNewPassword}
                                        placeholder="Введите новый пароль"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        <span className="password-icon">
                                            {showNewPassword ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                                <div className="password-strength">
                                    <div className={`strength-bar ${newPassword.length >= 6 ? 'strong' : newPassword.length >= 4 ? 'medium' : 'weak'}`}></div>
                                    <span className="strength-text">
                                        {newPassword.length >= 6 ? 'Сильный' : newPassword.length >= 4 ? 'Средний' : 'Слабый'}
                                    </span>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="settings-label">
                                    <span className="label-icon">✅</span>
                                    Подтвердите новый пароль
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        className="settings-input"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={handleChangeConfirmPassword}
                                        placeholder="Повторите новый пароль"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        <span className="password-icon">
                                            {showConfirmPassword ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <div className={`password-match ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                                        {newPassword === confirmPassword ? '✅ Пароли совпадают' : '❌ Пароли не совпадают'}
                                    </div>
                                )}
                            </div>

                            <button
                                className="settings-btn-primary"
                                onClick={changePassword}
                                disabled={isLoading || !password.trim() || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Изменение...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">🔐</span>
                                        Изменить пароль
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Информационная панель */}
                    <div className="settings-info-panel">
                        <div className="info-item">
                            <span className="info-icon">💡</span>
                            <div className="info-content">
                                <h4>Советы по безопасности</h4>
                                <p>Используйте сложные пароли с буквами, цифрами и символами</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">⚠️</span>
                            <div className="info-content">
                                <h4>Важно</h4>
                                <p>После изменения пароля вы будете автоматически выйдены из системы</p>
                            </div>
                        </div>
                        <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => exit()}
                                    >Выход</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;