import Registration from "./Components/Auth-Forms/Registration";
import Login from "./Components/Auth-Forms/Login";
import RefreshPassword from "./Components/Auth-Forms/RefreshPassword";
import Settings from "./Components/Create-Forms/Settings";
import Channel from "./Components/Create-Forms/Channel";
import Group from "./Components/Create-Forms/Group";
import ContactsList from "./Components/Create-Forms/ContactsList";
import Chats from "./Components/Chats/Menu";
import './App.css';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<Registration/>}/>
          <Route path="/login" element={<Login/>}/> 
          <Route path="/chats" element={<Chats/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/contacts" element={<ContactsList/>}/>
          <Route path="/group" element={<Group/>}/>
          <Route path="/channel" element={<Channel/>}/>
          <Route path="/forgot-password" element={<RefreshPassword/>}/>
        </Routes>
    </>
  );
}

export default App;
