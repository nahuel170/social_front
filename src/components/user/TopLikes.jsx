// src/components/TopLikes.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import Avatar from '../../assets/img/user.png';
import { fetchTopLikes } from '../../topLikesActions';
import { FaFire } from 'react-icons/fa';

export const TopLikes = () => {
  const dispatch = useDispatch();
  // topLikes es el array que maneja el reducer (con la estructura que devuelve tu endpoint)
  const topUsers = useSelector((state) => state.topLikes);

  useEffect(() => {
    // Despachamos la acción para obtener el top 10 de usuarios al montar el componente.
    dispatch(fetchTopLikes());

    // Si deseas actualizar periódicamente (polling) podrías hacer algo así:
    const interval = setInterval(() => {
      dispatch(fetchTopLikes());
    }, 30000); // cada 30 segundos
    return () => clearInterval(interval);

  }, [dispatch]);

  return (
    <aside className="top-likes">
      <h2>Top 10 Usuarios con más Likes</h2>
      <ol>
        {topUsers && topUsers.length > 0 ? (
          topUsers.map((userObj, index) => {
            // Cada elemento "userObj" tiene la forma:
            // { _id: { _id, nombre, nick, imagen }, totalLikes }
            const userData = userObj._id;
            const userId = userData._id;
            const nombre = userData.nombre;
            const nick = userData.nick;
            const imagen = userData.imagen;
            const avatarUrl = imagen
              ? `${Global.url}user/avatar/${imagen}`
              : Avatar;

            return (
              <li key={userId} className="top-likes-item">
                <span className="rank-number">{index + 1}.</span>
                <Link to={`/social/perfil/${userId}`} className="top-likes-link">
                  <img 
                    src={avatarUrl} 
                    alt={nombre} 
                    className="avatar"
                    title={`${nombre} (@${nick})`}
                    onError={(e) => { e.target.onerror = null; e.target.src = Avatar; }} // Fallback en caso de error
                  />
                  <span className="likes-count">{userObj.totalLikes} Likes</span>
                </Link>
              </li>
            );
          })
        ) : (
          <li>No hay   <FaFire className="icon-liked" /> por mostrar</li>
        )}
      </ol>
    </aside>
  );
};

// import React, { useEffect, useState } from 'react';
// import { Global } from '../../helpers/Global';
// import { Link } from 'react-router-dom';
// import Avatar from '../../assets/img/user.png';


// export const TopLikes = () => {
//     const [topUsers, setTopUsers] = useState([]);

//     useEffect(() => {
//         const fetchTopLikes = async () => {
//             try {
//                 const response = await fetch(`${Global.url}user/top-likes`, {
//                     headers: {
//                         'Authorization': localStorage.getItem("token")
//                     }
//                 });
//                 const data = await response.json();
//                 if (data.status === "success") {
//                     setTopUsers(data.users);
//                 }
//             } catch (error) {
//                 console.error("Error fetching top users:", error);
//             }
//         };

//         fetchTopLikes();
//     }, []);

//     return (
//         <aside className="top-likes">
//             <h2>Top 10 Usuarios con más Likes</h2>
//             <ol>
//                 {topUsers.map((user, index) => {
//                     // Construir la URL correcta del avatar
//                     const avatarUrl = user._id.imagen 
//                         ? `${Global.url}user/avatar/${user._id.imagen}` 
//                         : Avatar;

//                     return (
//                         <li key={user._id._id} className="top-likes-item">
//                             <span className="rank-number">{index + 1}.</span>
//                             <Link to={`/social/perfil/${user._id._id}`} className="top-likes-link">
//                                 <img 
//                                     src={avatarUrl} 
//                                     alt={user._id.nombre} 
//                                     className="avatar"
//                                     title={`${user._id.nombre} (@${user._id.nick})`} 
//                                     onError={(e) => e.target.src = Avatar} // Fallback en caso de error
//                                 />
//                                 <span className="likes-count">{user.totalLikes} Likes</span>
//                             </Link>
//                         </li>
//                     );
//                 })}
//             </ol>
//         </aside>
//     );
// };

// import React, { useEffect, useState } from 'react';
// import { Global } from '../../helpers/Global';
// import { Link } from 'react-router-dom';
// import Avatar from '../../assets/img/user.png'

// export const TopLikes = () => {
//     const [topUsers, setTopUsers] = useState([]);

//     useEffect(() => {
//         const fetchTopLikes = async () => {
//             try {
//                 const response = await fetch(`${Global.url}user/top-likes`);
//                 const data = await response.json();
//                 if (data.status === "success") {
//                     setTopUsers(data.users);
//                 }
//             } catch (error) {
//                 console.error("Error fetching top users:", error);
//             }
//         };

//         fetchTopLikes();
//     }, []);

//     return (
//         <aside className="top-likes">
//             <h2>Top 10 Usuarios con más Likes</h2>
//             <ol>
//                 {topUsers.map((user, index) => {
//                     // Construye la URL del avatar y haz un console.log para verificarla
//                     const avatarUrl = `${Global.url}user/avatar/${user._id._id}`;
//                     console.log("Avatar URL:", avatarUrl); // Debug para verificar URL

//                     return (
//                         <li key={user._id._id}>
//                             <span>{index + 1}. </span>
//                             <Link to={`/social/perfil/${user._id._id}`}>
//                                 <img 
//                                     src={avatarUrl} 
//                                     alt={user._id.nombre} 
//                                     className="avatar"
//                                     title={`${user._id.nombre} (@${user._id.nick})`} 
//                                     onError={(e) => e.target.src = Avatar} // Fallback en caso de error
//                                 />
//                             </Link>
//                             <span> - {user.totalLikes} Likes</span>
//                         </li>
//                     );
//                 })}
//             </ol>
//         </aside>
//     );
// };