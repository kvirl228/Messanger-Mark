import { useState, useEffect } from 'react'
import { NavLink, useNavigate} from 'react-router-dom';
import { auth_service, user_service } from '../../properties';
import { useUser } from "../context/UserContext";
import WebSocketService from "../../Service/WebSocketService";
import './Forms.css'
function Login(){
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')    
    const [email, setEmail] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { setUser } = useUser(); 

    const navigate = useNavigate()

    const handleChangeName = (event) => {
        setName(event.target.value)
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value)
    }

    const handleChangeEmail = (event) => {
        setEmail(event.target.value)
    }

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${auth_service}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
           username: name, 
            password: password,
            email: email
        }),
        mode: 'cors'
      });

      if(response.ok){
            const token = await response.text()
            localStorage.setItem("token", token)
            WebSocketService.connect(localStorage.getItem("token"));
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
                    navigate('/chats');
                }
            } catch (error) {
                console.error('Ошибка при получении информации о пользователе:', error);
            }
        }
        else{
            alert("Eror")
        }

        
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token !== null) {
//         navigate('/chats');
//     }
//     }, [navigate]);
    return (
      <div className="forms_block">
        <form className="forms_register" onSubmit={handleSubmit}>
          <div className="main_form_text">Вход</div>
          <div className="form_block">
            <label className="form_label">Имя</label>
            <input className="form_input" value = {name} onChange={handleChangeName}/>
          </div>
          <div className="form_block">
            <label className="form_label" >Почта</label>
            <input className="form_input" value={email} type="email" onChange={handleChangeEmail}/>
          </div> 
          <div className="form_block">
            <label className="form_label">Пароль</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form_input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(s => !s)}
                            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        >
                            {showPassword ? (
                                /* eye with slash (neutral) */
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c1.19 0 2.322.2 3.357.566"/>
                                    <path d="M21.542 12c-1.274 4.057-5.065 7-9.542 7a9.98 9.98 0 0 1-5.357-1.434"/>
                                    <path d="M3 3l18 18" />
                                </svg>
                            ) : (
                                /* eye (neutral) */
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"/>
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
          </div>
          <div>
            <label className="form_label" onClick={() => navigate('/forgot-password')}>
                забыли пароль
            </label>
          </div>
          <button className="form_btn" onClick={handleSubmit} >Войти</button>
          <div className="little_form_text"><NavLink to="/">Зарегестрироваться</NavLink></div>
        </form>
      </div>
    );
}
export default Login;