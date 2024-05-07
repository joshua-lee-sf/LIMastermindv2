import LogIn from "./LogIn/index.js";
import LogOut from './LogOut/index.js';
import { useSelector } from "react-redux";
import './index.scss';

const NavBar = () => {
    const {userName} = useSelector((state) => state.session);

    return (
        <div id="nav-bar">
            <div className="nav-left">
                <h1>Mastermind</h1>
            </div>
            <div className="nav-right">
                {!!userName ? <LogOut/> : <LogIn/>}
            </div>
        </div>
    )
};

export default NavBar;