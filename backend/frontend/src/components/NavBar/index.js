import { useRestoreUserQuery } from "../../store/loginRTKQuery.js";
import LogIn from "./LogIn/index.js";
import LogOut from './LogOut/index.js';
import './index.scss';

const NavBar = () => {

    const {data: currentUser } = useRestoreUserQuery();

    return (
        <div id="nav-bar">
            <div className="nav-left">
                <h1>Mastermind</h1>
            </div>
            <div className="nav-right">
                {!!currentUser?.userName ? <LogOut/> : <LogIn/>}
            </div>
        </div>
    )
};

export default NavBar;