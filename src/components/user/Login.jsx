import React, { useState } from 'react'
import { useForm } from './../../hooks/useForm';
import { Global } from './../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { setUser  } from '../../actions';


export const Login = () => {
  const { form, changed } = useForm({});
  const [saved, setSaved] = useState("not_sended");
  const { setAuth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();

    let userToLogin = form;

    const request = await fetch(Global.url + "user/login", {
      method: "POST",
      body: JSON.stringify(userToLogin),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await request.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.usuario));

    if (data && data.status === "success") {
      setSaved("login");

      // dispatch(setUser (data.usuario)); 
      setAuth(data.usuario);

      setTimeout(() => {
        window.location.reload();
      }, 2);


    } else {
      setSaved("error");
    }
  };


  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Login</h1>
      </header>
      <div className="login-container">
        <div className="login-box">
          <div class="logo">
            <header className="logo">
              <img src="fongo ig.webp" alt="Logo" />
              <h2>BIENVENIDOS</h2>
            </header>
          </div>
          < div className="content__posts">
            {saved === "login" ? (
              <strong className="alert alert-success">Usuario identificado correctamente!!</strong>
            ) : (
              ""
            )}
            {saved === "error" ? (
              <strong className="alert alert-danger">Usuario no se ha identificado!!</strong>
            ) : (
              ""
            )}
            <form className="login-form" onSubmit={loginUser}>
              <div className="input-group">
                <i className="fa-solid fa-user"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  onChange={changed}
                />
              </div>
              <div className="input-group">
                <i className="fa fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  onChange={changed}
                />
              </div>
              <button type="submit" className="btn-signin">
                Identifícate
              </button>
              <br />
              <br />
              <a className='A-registro' href="/registro">REGISTRARSE</a>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}


