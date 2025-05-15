import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPublications } from "../../../actions"; 
import { Global } from "../../../helpers/Global";
import useAuth from "../../../hooks/useAuth";
import { useLocation } from "react-router-dom";
import { TopLikes } from "../../user/TopLikes";

export const Sidebar = () => {
  const dispatch = useDispatch();
  const publications = useSelector((state) => state.publication.publications);
  const { auth } = useAuth();
  const location = useLocation();
  
  // Si el path es el del perfil del usuario, se muestra el formulario; de lo contrario se muestra TopLikes
  const isProfilePage = location.pathname === `/social/perfil/${auth._id}`;

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stored, setStored] = useState("not_stored");

  const savePublication = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const newPublication = {
      text: formRef.current.text.value,
      user: auth._id,
    };

    // Llamada para guardar la publicación
    const res = await fetch(`${Global.url}publication/save`, {
      method: "POST",
      body: JSON.stringify(newPublication),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await res.json();
    console.log("Nueva publicación:", data.publicationStored);

    if (data.status === "success") {
      // Si hay archivo, subir imagen
      const file = fileInputRef.current?.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file0", file);

        const uploadRequest = await fetch(
          `${Global.url}publication/upload/${data.publicationStored._id}`,
          {
            method: "POST",
            body: formData,
            headers: { Authorization: token },
          }
        );
        const uploadData = await uploadRequest.json();
        setStored(uploadData.status === "success" ? "stored" : "error");

        if (uploadData.status === "success") {
          // Si el endpoint devuelve la publicación actualizada, asignarla
          data.publicationStored = uploadData.publicationUpdated;
        }
      }
      
      // Actualiza la propiedad "user" para que tenga la info completa (por ejemplo, el avatar)
      data.publicationStored.user = auth;

      // Fusionar la nueva publicación al inicio del array
      const newPub = data.publicationStored;
      const newPubs = [newPub, ...publications];

      // Actualizar Redux
      dispatch(setPublications(newPubs));

      // Resetear el formulario
      if (formRef.current) formRef.current.reset();
      if (fileInputRef.current) fileInputRef.current.value = null;
    } else {
      console.error("Error al crear publicación:", data);
    }
  };

  return (
    <>
      {isProfilePage ? (
        <aside className="layout__aside">
          <header className="aside__header">
            <h1 className="aside__title">Crear publicación</h1>
          </header>
          <div className="aside__container-form">
            {stored === "stored" && (
              <strong className="alert alert-success">
                Publicada correctamente!!
              </strong>
            )}
            {stored === "error" && (
              <strong className="alert alert-danger">
                No se ha publicado nada!!
              </strong>
            )}
            <form
              className="container-form__form-post"
              onSubmit={savePublication}
              ref={formRef}
            >
              <div className="form-post__inputs">
                <label htmlFor="file" className="form-post__label">
                  Sube tu foto
                </label>
                <input
                  type="file"
                  name="file0"
                  id="file"
                  className="form-post__image"
                  ref={fileInputRef}
                />
              </div>
              <div className="form-post__inputs">
                <label htmlFor="text" className="form-post__label">
                  Descripción
                </label>
                <textarea name="text" className="form-post__textarea" />
              </div>
              <input
                type="submit"
                value="Enviar"
                className="form-post__btn-submit"
              />
            </form>
          </div>
        </aside>
      ) : (
        // Si no es la página de perfil, muestra el TopLikes
        <TopLikes />
      )}
    </>
  );
};

// import React, { useEffect, useRef, useState } from 'react';
// import Avatar from '../../../assets/img/user.png';
// import useAuth from '../../../hooks/useAuth';
// import { Global } from '../../../helpers/Global';
// import { Link, useLocation } from 'react-router-dom';
// import { useForm } from '../../../hooks/useForm';
// import {TopLikes} from '../../user/TopLikes';

// export const Sidebar = ({ onPublicationCreated }) => {
//     const fileInputRef = useRef(null);
//     const formRef = useRef(null);
   
//     const { auth, counters } = useAuth();
//     const { form, changed } = useForm({});
//     const [stored, setStored] = useState("not_stored");
//     const location = useLocation(); 

   
//     const savePublication = async (e) => {
//         e.preventDefault();
    
//         const token = localStorage.getItem("token");
//         let newPublication = form;
//         newPublication.user = auth._id;
    
//         const request = await fetch(Global.url + "publication/save", {
//             method: "POST",
//             body: JSON.stringify(newPublication),
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": token
//             }
//         });
    
//         const data = await request.json();
//         console.log("Nueva publicación:", data.publicationStored);

//         if (data.status === "success") {
//             const fileInput = fileInputRef.current;
//             const file = fileInput?.files[0];
    
//             if (file) {
//                 const formData = new FormData();
//                 formData.append("file0", file);
    
//                 const uploadRequest = await fetch(Global.url + "publication/upload/" + data.publicationStored._id, {
//                     method: "POST",
//                     body: formData,
//                     headers: {
//                         "Authorization": token
//                     }
//                 });
    
//                 const uploadData = await uploadRequest.json();
//                 setStored(uploadData.status === "success" ? "stored" : "error");
//             } else {
//                 console.warn("No file selected for upload.");
//             }
//             if (formRef.current) {
//                 formRef.current.reset();  // <--- Solo si existe
//               }
//               if (fileInputRef.current) {
//                 fileInputRef.current.value = null; // Solo si existe el input
//               }
//                // 2c) **Re-Fetch** usando la prop:
          
//                 onPublicationCreated();
            
//             } else {
//                 console.error("Error saving publication:", data);
//             }
//         };

 
//     const isProfilePage = location.pathname === `/social/perfil/${auth._id}`;

//     return (
//         <>
//             {isProfilePage ? (
//                 <aside className="layout__aside">
//                     <header className="aside__header">
//                         <h1 className="aside__title">Hola, {auth.nombre}</h1>
//                     </header>
    
//                         <div className="aside__container-form">
//                             {stored === "stored" && <strong className="alert alert-success">Publicada correctamente!!</strong>}
//                             {stored === "error" && <strong className="alert alert-danger">No se ha publicado nada!!</strong>}
    
//                             <form className="container-form__form-post" onSubmit={savePublication} ref={formRef}>
//                                 <div className="form-post__inputs">
//                                     <label htmlFor="file" className="form-post__label">Sube tu foto </label>
//                                     <input type="file" name="file0" id="file" className="form-post__image" ref={fileInputRef} />
//                                 </div>
//                                 <div className="form-post__inputs">
//                                     <label htmlFor="text" className="form-post__label">Agregar descripcion</label>
//                                     <textarea name="text" className="form-post__textarea" onChange={changed} />
//                                 </div>
//                                 <input type="submit" value="Enviar" className="form-post__btn-submit" />
//                             </form>
//                         </div>
                    
//                 </aside>
//             ): (<TopLikes/>) }
//         </>
//     );
// };

    // const savePublication = async (e) => {
    //     e.preventDefault();
    //     const token = localStorage.getItem("token");

    //     let newPublication = form; // Asume que 'form' contiene el texto de la publicación
    //     newPublication.user = auth._id;

    //     // Guardar la publicación en el servidor
    //     const request = await fetch(Global.url + "publication/save", {
    //         method: "POST",
    //         body: JSON.stringify(newPublication),
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": token
    //         }
    //     });

    //     const data = await request.json();

    //     if (data.status === "success") {
    //         const fileInput = document.querySelector("#file");

    //         if (fileInput.files[0]) {
    //             const formData = new FormData();
    //             formData.append("file0", fileInput.files[0]);

    //             const uploadRequest = await fetch(Global.url + "publication/upload/" + data.publicationStored._id, {
    //                 method: "POST",
    //                 body: formData,
    //                 headers: {
    //                     "Authorization": token
    //                 }
    //             });

    //             const uploadData = await uploadRequest.json();
    //             console.log("Data after upload:", uploadData); // Verifica la respuesta aquí

    //             if (uploadData.status === "success") {
    //                 setStored("stored");
    //                 // Actualizar el estado para reflejar el archivo subido en la publicación
    //                 setPublication(prev => ({
    //                     ...prev,
    //                     file: uploadData.file.filename
    //                 }));
    //             } else {
    //                 setStored("error");
    //             }

    //             // Resetear el formulario después de subir el archivo
    //             document.getElementById('publication-form').reset();
    //         }
    //     } else {
    //         setStored("error");
    //     } 
    // };