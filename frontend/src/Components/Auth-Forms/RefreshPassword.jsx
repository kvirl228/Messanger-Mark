import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forms.css'
import { auth_service, chat_service, refreshToken, user_service } from '../../properties';

function RefreshPassword() {
    const [firstSend, setFirstSend] = useState(false);
    const [secondSend, setSecondSend] = useState(false);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChangeEmail = (event) => {
        setEmail(event.target.value)
    }
    
    const firstResend = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${auth_service}/auth/codeForReset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email:email })
            });
            setFirstSend(true);
            console.log("xvfxc")
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const secondResend = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${auth_service}/auth/checkCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, code: code })
            });
            setSecondSend(true);
            
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        try {
            const response = await fetch(`${auth_service}/auth/refresh/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, newPassword: password })
            });
            if (response.ok) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    return(
        <>
            {!firstSend ? (
                <div className="forms_block">
                <form className="forms" onSubmit={firstResend}>
                    <div className="main_form_text">Сброс пароля</div>
                    <div className="form_block">
                        <label className="form_label">Email</label>
                        <input className="form_input" value={email} type="email" onChange={handleChangeEmail} />
                    </div>
                    <div className="form_block">
                        <button className="form_btn">Отправить код</button>
                    </div>
                </form>
            </div>
            ): ( !secondSend ? (
                <div className="forms_block">
                    <form className="forms" onSubmit={secondResend}>
                    <div className="main_form_text">Сброс пароля</div>
                    <div className="form_block">
                        <label className='form_label'>Введите код</label>
                        <input className="form_input" type="text" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="form_block">
                        <button className="form_btn" >Отправить код</button>
                    </div>
                    </form>
                </div>
            ) : (
                <div className="forms_block">
                    <form className="forms" onSubmit={handlePasswordReset}>
                        <div className="main_form_text">Сброс пароля</div>
                        <div className="form_block">
                            <label className="form_label">Новый пароль</label>
                            <input className="form_input" value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="form_block">
                            <label className="form_label">Подтвердите пароль</label>
                            <input className="form_input" value={confirmPassword} type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <div className="form_block">
                            <button className="form_btn">Сбросить пароль</button>
                        </div>
                        
                    </form>
                </div>
            )
                
            )}
            
        </>
    )

}

export default RefreshPassword;