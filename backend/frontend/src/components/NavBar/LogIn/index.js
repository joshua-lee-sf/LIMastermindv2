import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoginUserMutation } from "../../../store/loginRTKQuery";
import { setUser } from "../../../store/slices/sessionSlice";

const LogIn = () => {
    const [userName, setUsername] = useState('');
    const [password, setPassword ] = useState('');
    const [errors, setErrors] = useState('');
    const dispatch = useDispatch();
    const [login, {isLoading}] = useLoginUserMutation();

    const handleLoginClick = async (event) => {
        event.preventDefault();
        if (!password.length || !userName.length) {
            setErrors('Username or Password field is empty');
        }
        const { data } = await login({userName, password});
        dispatch(setUser(data));
    };

    const handleCreateNewUserClick = (event) => {
        event.preventDefault();
        console.log("hello nerds");
    };

    return (
        <div>
            <form id="Login Form" onSubmit={(e) => handleLoginClick(e)}>
                <input type="test" value={userName} placeholder="username" onChange={(e) => setUsername(e.target.value)}></input>
                <input type="password" value={password} placeholder="password" onChange={(e)=>setPassword(e.target.value)}></input>
                <button type="submit">Login</button>
            </form>
            <button type="submit" onClick={(e) => handleCreateNewUserClick(e)}>Create New User</button>
        </div>
    )
};

export default LogIn;