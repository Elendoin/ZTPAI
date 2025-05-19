import {useState, useEffect} from 'react'
import './LoginStyle.css'

function Login() {

    return (
        <div className="container">
            <div className="login-container">
                <form className="login" action="login" method="POST">
                    <div className="login-text">Email</div>
                    <input className="email-input" name="email" type="text" placeholder="email@email.com"/>
                    <div className="login-text">Password</div>
                    <input className="email-input" name="password" type="password" placeholder="password"/>
                    <button className="login-button" type="submit">Log in</button>
                </form>
                <a href="register">
                    <button className="register-button">Register</button>
                </a>
                <p className="login-text" id="datetime" style={{ display: 'flex', justifyContent: 'center' }}></p>
            </div>
        </div>
    )
}

export default Login;