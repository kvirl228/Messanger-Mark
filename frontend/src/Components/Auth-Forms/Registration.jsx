import { useState,useEffect } from 'react';
import './Forms.css'
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { auth_service } from '../../properties';
import React from 'react';

function Registration(){

    
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [bio, setBio] = useState('')

    const [code, setCode] = useState('')
    const [isVerify, setIsVerify] = useState(false)
    const [passwordError, setPasswordError] = useState(''); // добавлено
    const [resendWait, setResendWait] = useState(0); // добавлено

    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isVerify) return;
        setResendWait(120);
    }, [isVerify]);

    useEffect(() => {
        if (resendWait <= 0) return;
        const timer = setTimeout(() => setResendWait(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendWait]);

    const handleChangeName = (event) => {
        setName(event.target.value)
    }

    const handleChangeBio = (event) => {
      setBio(event.target.value)
    }

    const handleChangeEmail = (event) => {
        setEmail(event.target.value)
        
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value)
    } 

    const handleChangeCode = (event) => {
      setCode(event.target.value)
    }

    const handleRegisterForm = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (password !== passwordConfirm) {
            setPasswordError('Пароли не совпадают');
            return;
        }
        try {
            const response = await fetch(`${auth_service}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: name,
                    bio: bio,
                    email: email,
                    password: password,
                }),
                // mode: 'cors'
            });

            if (response.ok) {
                setIsVerify(true)
            } else {
                alert('Ошибка при отправке данных');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const verifyemail = async () => {
      try{
        const response = await fetch(`${auth_service}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              email:email,
              code:code
          }),
          // mode: 'cors'
        });

        if (response.ok){
          navigate('/login')
        }
        else {
          alert('Ошибка при отправке данных');
        }
      }catch (error) {
        console.error('Ошибка:', error);
      }
    }

    const resendCode = async () => {
      if (resendWait > 0) return;
      try{
        const response = await fetch(`${auth_service}/auth/resend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              email:email
          }),
          // mode: 'cors'
        });

        if (response.ok){
          setResendWait(120);
          alert("Проверьте почту")
        }
        else {
          alert('Ошибка при отправке данных');
        }
      }catch (error) {
        console.error('Ошибка:', error);
      }
    }

    // useEffect(() => {
    //   const token = localStorage.getItem("token");
    //   if (token !== null) {
    //     navigate('/chats');
    //   }
    // }, [navigate]);

    return(
      <>
      {!isVerify ? (
        <div className="forms_block">
            <form className="forms_register" onSubmit={handleRegisterForm}>
                <div className="main_form_text">Регистрация</div>
                <div className="form_block">
                    <label className="form_label">Имя</label>
                    <input className="form_input" value={name} onChange={handleChangeName}/>
                </div>
                <div className="form_block">
                    <label className="form_label">Описание</label>
                    <textarea className="form_input" value={bio} type="tex" onChange={handleChangeBio}/>
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

                <div className="form_block">
                    <label className="form_label">Повторите пароль</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            className="form_input"
                            value={passwordConfirm}
                            onChange={e => setPasswordConfirm(e.target.value)}
                            placeholder="Повторите пароль"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirm(s => !s)}
                            aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
                            title={showConfirm ? "Скрыть пароль" : "Показать пароль"}
                        >
                            {showConfirm ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c1.19 0 2.322.2 3.357.566"/>
                                    <path d="M21.542 12c-1.274 4.057-5.065 7-9.542 7a9.98 9.98 0 0 1-5.357-1.434"/>
                                    <path d="M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"/>
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {passwordError && (
                        <div className="little_form_text" style={{ color: 'var(--danger, #e74c3c)', marginTop: 8 }}>
                            {passwordError}
                        </div>
                    )}
                </div>

                <div className="form_block">
                    <label className="form_label">Почта</label>
                    <input className="form_input" value={email} type="email" onChange={handleChangeEmail}/>
                </div>

                
                <button className="form_btn" type='submit'>Создать</button>
                <div className="little_form_text"><NavLink to = "/login">Войти</NavLink></div>
            </form>
        </div>
         ) : (
          <div className="forms_block">
            <form className="forms_register">
              <div className="form_block">
                    <label className="form_label">Верификационный код</label>
                    <input className="form_input" value={code} type="email" onChange={handleChangeCode}/>
                    <button className="form_btn" type='submit' onClick={verifyemail}>Проверить</button>
                  </div>
                <div className='form_block'>
                  <label className="form_label">нажмите для переотправки через 2 минут</label>
                  <button className="form_btn" type='submit' onClick={resendCode}>Проверить</button>
                </div>
                  
            </form>
          </div>
         )}
      </>
    )
}

export default Registration;