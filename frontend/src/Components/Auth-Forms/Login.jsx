import { useState } from 'react'
import { NavLink, useNavigate} from 'react-router-dom';
import { auth_service } from '../../properties';
import './Forms.css'
function Login(){
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
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
            navigate('/chats', { replace: true })
        }
        else{
            alert("Eror")
        }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };
    return(
        <div className="forms_block">
            <form className="forms">
                <div className="main_form_text">Вход</div>
                <div className="form_block">
                    <label className="form_label">Имя</label>
                    <input className="form_input" value = {name} onChange={handleChangeName}/>
                </div>
                <div className="form_block">
                    <label className="form_label" >Почта</label>
                    <input className="form_input" value={email} onChange={handleChangeEmail}/>
                </div> 
                <div className="form_block">
                    <label className="form_label" >Пароль</label>
                    <input className="form_input" value={password} onChange={handleChangePassword}/>
                </div> 
                <button className="form_btn" onClick={handleSubmit} >Войти</button>
                <div className="little_form_text"><NavLink to="/">Зарегестрироваться</NavLink></div>
            </form>
        </div>
    )
}
export default Login;