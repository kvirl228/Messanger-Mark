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
                    <input className="form_input" value={email} type="email" onChange={handleChangeEmail}/>
                </div> 
                <div className="form_block">
                    <label className="form_label" >Пароль</label>
                    <input className="form_input" value={password} type="password" onChange={handleChangePassword}/>
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
    )
}
export default Login;