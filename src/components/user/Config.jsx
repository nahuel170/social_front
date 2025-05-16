import React, { useState } from 'react'
import useAuth from './../../hooks/useAuth';
import { Global } from '../../helpers/Global';
import { SerializeForm } from '../../helpers/SerializeForm';
import Avatar from '../../assets/img/user.png';

export const Config = () => {
  const { auth, setAuth } = useAuth();
  const [saved, setSaved] = useState("not_saved");

  const updateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      let newDataUser = SerializeForm(e.target);
      delete newDataUser.file0;

      const request = await fetch(Global.url + "user/update", {
        method: "PUT",
        body: JSON.stringify(newDataUser),
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      const data = await request.json();

      if (data.status === "success" && data.user) {
        setAuth({ ...auth, ...data.user });
        setSaved("saved");
      } else {
        setSaved("error");
      }

      const fileInput = document.querySelector("#file");
      if (data.status === "success" && fileInput.files[0]) {
        const formData = new FormData();
        formData.append('file0', fileInput.files[0]);
        const uploadRequest = await fetch(Global.url + "user/upload", {
          method: "POST",
          body: formData,
          headers: { "Authorization": token }
        });
        const uploadData = await uploadRequest.json();
        if (uploadData.status === "success" && uploadData.user) {
          delete uploadData.password;
          setAuth(uploadData.user);
        } else {
          setSaved("error");
        }
      }

    } catch (error) {
      console.error("Error en la actualización del usuario:", error);
      setSaved("error");
    }
  };

  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Ajustes</h1>
      </header>

      <div className="content__posts">
        <div className="aside__container-form config-container">
          {saved === "saved" && (
            <strong className="alert alert-success">
              Usuario actualizado correctamente!!
            </strong>
          )}
          {saved === "error" && (
            <strong className="alert alert-danger">
              Usuario no se ha actualizado!!
            </strong>
          )}

          <form className="config-form" onSubmit={updateUser}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input type="text" name="nombre" defaultValue={auth.nombre} />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input type="text" name="apellido" defaultValue={auth.apellido} />
            </div>

            <div className="form-group">
              <label htmlFor="nick">Nick</label>
              <input type="text" name="nick" defaultValue={auth.nick} />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea name="bio" defaultValue={auth.bio} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" name="email" defaultValue={auth.email} />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" name="password" />
            </div>

            <div className="form-group avatar">
              <div className="general-info__container-avatar">
                {auth.imagen !== "default.png" ? (
                  <img
                    src={Global.url + "user/avatar/" + auth.imagen}
                    alt="Foto de perfil"
                    className="container-avatar__img"
                  />
                ) : (
                  <img src={Avatar} alt="Foto de perfil" className="container-avatar__img" />
                )}
              </div>
              <input type="file" name="file0" id="file" />
            </div>

            <input type="submit" value="Actualizar" />
          </form>
        </div>
      </div>
    </>
  );
};