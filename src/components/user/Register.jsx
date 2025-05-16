import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { Global } from './../../helpers/Global';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

const options = [
  { key: 'usuario', text: 'Usuario', value: 'usuario' },
  { key: 'vendedor', text: 'Vendedor/a', value: 'vendedor' },
  { key: 'administrador', text: 'Administrador', value: 'administrador' },


];


export const Register = () => {

  const { form, changed } = useForm({});
  const [saved, setSaved] = useState('not_sended');

  const saveUser = async (e) => {
    e.preventDefault();
    let newUser = form;

    const request = await fetch(Global.url + "user/registro", {
      method: "POST",
      body: JSON.stringify(newUser),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await request.json();
    if (data.status == "success") {
      setSaved("saved");
    } else {
      setSaved("error");
    }
    console.log(data);
  }


  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Registro</h1>
      </header>
      <div className="content__posts">
        <div className="login-container">
          <div className="login-box">
            <div class="logo">
              <header className="logo">
                <img src="fongo ig.webp" alt="Logo" />
                <h2>BIENVENIDOS</h2>
              </header>
            </div>


            {saved == "saved" ?
              <strong className='alert alert-success'>Usuario registrado correctamente!! Logueate!! </strong>
              : ''}
            {saved == "error" ?
              <strong className='alert alert-danger'>Usuario no se ha registrado!! </strong>
              : ''}
            <form className="login-form" onSubmit={saveUser}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input type="text" name="nombre" placeholder="Nombre" onChange={changed} />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input type="text" name="apellido" placeholder="Apellido" onChange={changed} />
              </div>
              <div className="form-group">
                <label htmlFor="nick">Nick</label>
                <input type="text" name="nick" placeholder="Nick" onChange={changed} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input type="email" name="email" placeholder="Correo Electrónico" onChange={changed} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input type="password" name="password" placeholder="Contraseña" onChange={changed} />
              </div>
              {/* <div className="form-group">
            <label htmlFor="rol">Selecciona tu Rol</label>
            <Dropdown
              clearable
              options={options}
              selection
              placeholder="Selecciona tu rol"
              name="rol"
              onChange={(e, { value }) =>
                changed({ target: { name: "rol", value } })
            }
            />
          </div> */}
              <button type="submit" className="btn-signin">
                Registrate
              </button>
            </form>
          </div>
        </div>
      </div>
    </>

  )
}

