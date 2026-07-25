import { useState,useEffect } from 'react';
import './Forms.css'
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { auth_service } from '../../properties';
function Registration(){

    
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [isVerify, setIsVerify] = useState(false)

    const navigate = useNavigate();

    const handleChangeName = (event) => {
        setName(event.target.value)
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



    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(`${auth_service}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              username:name,
              email:email,
              password:password,
          }),
          // mode: 'cors'
        });

        if (response.ok) {
          // navigate('/login')
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
          alert("Проверьте почту")
        }
        else {
          setIsVerify(true)
          alert('Ошибка при отправке данных');
        }
      }catch (error) {
        setIsVerify(true)
        console.error('Ошибка:', error);
      }
    }

    return(
      <>
      {!isVerify ? (
        <div className="forms_block">
            <form className="forms_register" onSubmit={handleSubmit}>
                <div className="main_form_text">Регистрация</div>
                <div className="form_block">
                    <label className="form_label">Имя</label>
                    <input className="form_input" value={name} onChange={handleChangeName}/>
                </div>
                <div className="form_block">
                    <label className="form_label">Пароль</label>
                    <input className="form_input" value={password} onChange={handleChangePassword}/>
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