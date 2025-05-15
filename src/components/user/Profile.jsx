import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import useAuth from '../../hooks/useAuth';
import { Global } from '../../helpers/Global';
import { getProfile } from '../../helpers/GetProfile';
import Avatar from '../../assets/img/user.png';
import { CiUnread } from 'react-icons/ci';

// Importamos acciones
import { setProfile } from '../../profileActions';
import {
  setPublications,
  likePublication,
  unlikePublication,
  followedUser,
  userUnfollowed,
} from '../../actions';

import { PublicationList } from '../publication/PublicationList';

export const Profile = () => {
  const dispatch = useDispatch();
  const { auth } = useAuth(); // usuario logueado

  // Redux: perfil y contadores
  const {
    userProfile,
    followersCount,
    followingCount,
    publicationsCount,
    likesTotal,
  } = useSelector((state) => state.profile);

  // Redux: publicaciones
  const publications = useSelector((state) => state.publication.publications);

  // Estados locales
  const [iFollow, setIFollow] = useState(false);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPubs, setLoadingPubs] = useState(true);

  const { userId } = useParams();

  // Puede ver publicaciones si sigue o es su propio perfil
  const canViewPublications = iFollow || auth._id === userId;

  // Al cambiar de perfil: limpiar y recargar
  useEffect(() => {
    if (userId) {
      setLoadingProfile(true);
      setLoadingPubs(true);

      // Limpiar estado anterior
      dispatch(
        setProfile(null, {
          followers: 0,
          following: 0,
          publications: 0,
          likesTotal: 0,
        })
      );
      dispatch(setPublications([]));

      // Cargar datos
      const loadData = async () => {
        await fetchProfileData();
        setLoadingProfile(false);
        await getPublications(1, true);
        setLoadingPubs(false);
      };
      loadData();
    }
  }, [userId]);

  // (A) Cargar perfil y contadores
  const fetchProfileData = async () => {
    try {
      const dataUser = await getProfile(userId);
      const countersRes = await fetch(
        `${Global.url}user/counters/${userId}`,
        {
          method: 'GET',
          headers: { Authorization: localStorage.getItem('token') },
        }
      );
      const countersData = await countersRes.json();
      dispatch(setProfile(dataUser.usuario, countersData));

      // Actualizar iFollow
      setIFollow(!!(dataUser.following && dataUser.following._id));
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // (B) Cargar publicaciones
  const getPublications = async (nextPage = 1, reset = false) => {
    try {
      const res = await fetch(
        `${Global.url}publication/listp/${userId}/${nextPage}`,
        { headers: { Authorization: localStorage.getItem('token') } }
      );
      const data = await res.json();
      if (data.status === 'success') {
        let newPubs = data.publications;
        if (!reset && publications.length) {
          newPubs = [...publications, ...data.publications];
        }
        dispatch(setPublications(newPubs));
        setPage(data.page);
        if (data.page >= data.pages) setMore(false);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  // (C) Like / Unlike
  const handleLike = async (publicationId) => {
    try {
      const res = await fetch(
        `${Global.url}publication/like/${publicationId}`,
        { method: 'POST', headers: { Authorization: localStorage.getItem('token') } }
      );
      const data = await res.json();
      if (data.status === 'success') {
        dispatch(likePublication(publicationId, auth._id));
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleUnlike = async (publicationId) => {
    try {
      const res = await fetch(
        `${Global.url}publication/unlike/${publicationId}`,
        { method: 'POST', headers: { Authorization: localStorage.getItem('token') } }
      );
      const data = await res.json();
      if (data.status === 'success') {
        dispatch(unlikePublication(publicationId, auth._id));
      }
    } catch (error) {
      console.error('Error al quitar like:', error);
    }
  };

  // (D) Follow / Unfollow
  const follow = async (idToFollow) => {
    try {
      const res = await fetch(`${Global.url}follow/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ followed: idToFollow }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIFollow(true);
        dispatch(followedUser(idToFollow));
      }
    } catch (error) {
      console.error('Error al hacer follow:', error);
    }
  };

  const unFollow = async (idToUnfollow) => {
    try {
      const res = await fetch(
        `${Global.url}follow/unfollow/${idToUnfollow}`,
        { method: 'DELETE', headers: { Authorization: localStorage.getItem('token') } }
      );
      const data = await res.json();
      if (data.status === 'success') {
        setIFollow(false);
        dispatch(userUnfollowed(idToUnfollow));
      }
    } catch (error) {
      console.error('Error al hacer unfollow:', error);
    }
  };

  // Renderizado
  if (loadingProfile) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <>
      <header className="aside__profile-info">
        <div className="profile-info__general-info">
          <div className="general-info__container-avatar">
            {userProfile.imagen !== 'default.png' ? (
              <img
                src={`${Global.url}user/avatar/${userProfile.imagen}`}
                className="container-avatar__img"
                alt="Foto de perfil"
              />
            ) : (
              <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
            )}
          </div>

          <div className="general-info__container-names">
            <h1>{userProfile.nick}</h1>
            <h2>{userProfile.bio}</h2>
            {userProfile._id !== auth._id &&
              (iFollow ? (
                <button
                  onClick={() => unFollow(userProfile._id)}
                  className="content__button--red"
                >
                  Cancelar suscripción
                </button>
              ) : (
                <button
                  onClick={() => follow(userProfile._id)}
                  className="content__button content__button--rigth"
                >
                  Suscribirme
                </button>
              ))}
          </div>
        </div>

        <div className="profile-info__stats">
          <Link to={`/social/siguiendo/${userProfile._id}`} className="stats__following following__link">
            <span className="following__title">Siguiendo</span>
            <span className="following__number">{followingCount}</span>
          </Link>
          <Link to={`/social/seguidores/${userProfile._id}`} className="stats__following following__link">
            <span className="following__title">Seguidores</span>
            <span className="following__number">{followersCount}</span>
          </Link>
          <Link to={`/social/perfil/${userProfile._id}`} className="stats__following following__link">
            <span className="following__title">Publicaciones</span>
            <span className="following__number">{publicationsCount}</span>
          </Link>
          <div className="stats__following">
            <span className="following__title">Likes</span>
            <span className="following__number">{likesTotal}</span>
          </div>
        </div>
      </header>

      {canViewPublications ? (
        loadingPubs ? (
          <p>Cargando publicaciones...</p>
        ) : (
          <PublicationList
            publications={publications}
            getPublications={getPublications}
            page={page}
            setPage={setPage}
            more={more}
            setMore={setMore}
            handleLike={handleLike}
            handleUnlike={handleUnlike}
            userId={auth._id}
          />
        )
      ) : (
        <div className="icon-container">
          <h1 className="UnRead"><CiUnread /></h1>
          <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
        </div>
      )}
    </>
  );
};


//ultimo codigo
// import React, { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';

// import useAuth from './../../hooks/useAuth';
// import { Global } from '../../helpers/Global';
// import { getProfile } from './../../helpers/GetProfile';
// import Avatar from '../../assets/img/user.png';
// import { CiUnread } from 'react-icons/ci';

// // Importamos acciones
// import { setProfile } from '../../profileActions'; // { type: 'SET_PROFILE' }
// import {
//   setPublications,
//   likePublication,
//   unlikePublication,
//   followedUser,
//   userUnfollowed,
// } from '../../actions';

// import { PublicationList } from '../publication/PublicationList';
// import { Sidebar } from '../layout/private/Sidebar';
// export const Profile = () => {
//   const dispatch = useDispatch();
//   const { auth } = useAuth(); // user logueado

//   // 1) Del redux "profile" => userProfile y contadores
//   const {
//     userProfile,
//     followersCount,
//     followingCount,
//     publicationsCount,
//     likesTotal,
//   } = useSelector((state) => state.profile);

//   // 2) Obtenemos las publicaciones del "publication" reducer
//   const publications = useSelector((state) => state.publication.publications);

//   // Estados locales mínimos
//   const [iFollow, setIFollow] = useState(false);
//   const [page, setPage] = useState(1);
//   const [more, setMore] = useState(true);
//   // estado local "user" para guardar la dataUser que llega del helper (opcional)
//   const [user, setUser] = useState({});

//   const params = useParams();
//   const userId = params.userId;

//   // Determina si el user logueado puede ver las publicaciones
//   const canViewPublications = iFollow || auth._id === userId;

//   useEffect(() => {
//     if (userId) {
//       // 1) Cargar info (user + counters) en profileReducer
//       fetchProfileData();
//       // 2) Cargar publicaciones en publication reducer
//       getPublications(1, true);
//     }
//   }, [userId]);

//   // -------------
//   // FUNCIONES
//   // -------------

//   // (A) Cargar info del perfil + contadores en profileReducer
//   const fetchProfileData = async () => {
//     try {
//       // 1) Info del user
//       const dataUser = await getProfile(userId);
//       setUser(dataUser.usuario);

//       // 2) Info de contadores
//       const countersRes = await fetch(Global.url + 'user/counters/' + userId, {
//         method: 'GET',
//         headers: {
//           Authorization: localStorage.getItem('token'),
//         },
//       });
//       const countersData = await countersRes.json();

//       // Guardamos en el profileReducer
//       dispatch(setProfile(dataUser.usuario, countersData));

//       // Chequear si el user logueado sigue a este perfil
//       if (dataUser.following && dataUser.following._id) {
//         setIFollow(true);
//       } else {
//         setIFollow(false);
//       }
//     } catch (error) {
//       console.error('Error fetching profile data:', error);
//     }
//   };

//   // (B) Cargar publicaciones y guardarlas en redux (publicationReducer)
//   const getPublications = async (nextPage = 1, reset = false) => {
//     try {
//       const res = await fetch(
//         Global.url + 'publication/listp/' + userId + '/' + nextPage,
//         {
//           headers: {
//             Authorization: localStorage.getItem('token'),
//           },
//         }
//       );
//       const data = await res.json();
//       if (data.status === 'success') {
//         let newPubs = data.publications;
//         if (!reset && publications.length > 0) {
//           newPubs = [...publications, ...data.publications];
//         }
//         // Guardamos en Redux
//         dispatch(setPublications(newPubs));

//         setPage(data.page);
//         if (data.page >= data.pages) {
//           setMore(false);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching publications:', error);
//     }
//   };

//   // (C) Manejar Like
//   const handleLike = async (publicationId) => {
//     try {
//       const response = await fetch(
//         Global.url + 'publication/like/${publicationId}',
//         {
//           method: 'POST',
//           headers: {
//             Authorization: localStorage.getItem('token'),
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status === 'success') {
//         // Despachamos acción a Redux (publicationReducer)
//         dispatch(likePublication(publicationId, auth._id));
//       }
//     } catch (error) {
//       console.error('Error al dar like:', error);
//     }
//   };

//   // (D) Manejar UnLike
//   const handleUnlike = async (publicationId) => {
//     try {
//       const response = await fetch(
//         Global.url + 'publication/unlike/${publicationId}' ,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: localStorage.getItem('token'),
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status === 'success') {
//         dispatch(unlikePublication(publicationId, auth._id));
//       }
//     } catch (error) {
//       console.error('Error al quitar like:', error);
//     }
//   };

//   // (E) Manejar Follow/Unfollow
//   const follow = async (userIdToFollow) => {
//     try {
//       const response = await fetch(Global.url + 'follow/save', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: localStorage.getItem('token'),
//         },
//         body: JSON.stringify({ followed: userIdToFollow }),
//       });
//       const data = await response.json();
//       if (data.status === 'success') {
//         setIFollow(true);
//         dispatch(followedUser(userIdToFollow));
//       }
//     } catch (error) {
//       console.error('Error al hacer follow:', error);
//     }
//   };

//   const unFollow = async (userIdToUnfollow) => {
//     try {
//       const response = await fetch(
//         Global.url + 'follow/unfollow/' + userIdToUnfollow,
//         {
//           method: 'DELETE',
//           headers: {
//             Authorization: localStorage.getItem('token'),
//           }
//         }
//       );
//       const data = await response.json();
//       if (data.status === 'success') {
//         setIFollow(false);
//         dispatch(userUnfollowed(userIdToUnfollow));
//       }
//     } catch (error) {
//       console.error('Error al hacer unfollow:', error);
//     }
//   };

//   // ------------------
//   // RENDER
//   // ------------------

//   return (
//     <>
//       {userProfile ? (
//         <header className="aside__profile-info">
//           <div className="profile-info__general-info">
//             <div className="general-info__container-avatar">
//               {userProfile.imagen !== 'default.png' ? (
//                 <img
//                   src={Global.url + 'user/avatar/' + userProfile.imagen}
//                   className="container-avatar__img"
//                   alt="Foto de perfil"
//                 />
//               ) : (
//                 <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
//               )}
//             </div>

//             <div className="general-info__container-names">
//               <h1>{userProfile.nick}</h1>
//               <h2>{userProfile.bio}</h2>
//               {userProfile._id !== auth._id && (
//                 iFollow ? (
//                   <button
//                     onClick={() => unFollow(userProfile._id)}
//                     className="content__button--red"
//                   >
//                     Cancelar suscripción
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => follow(userProfile._id)}
//                     className="content__button content__button--rigth"
//                   >
//                     Suscribirme
//                   </button>
//                 )
//               )}
//             </div>
//           </div>

//           {/* ESTADISTICAS DEL PERFIL (Redux) */}
//           <div className="profile-info__stats">
//             <div className="stats__following">
//               <Link
//                 to={'/social/siguiendo/' + userProfile._id}
//                 className="following__link"
//               >
//                 <span className="following__title">Siguiendo</span>
//                 <span className="following__number">{followingCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link
//                 to={'/social/seguidores/' + userProfile._id}
//                 className="following__link"
//               >
//                 <span className="following__title">Seguidores</span>
//                 <span className="following__number">{followersCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link
//                 to={'/social/perfil/' + userProfile._id}
//                 className="following__link"
//               >
//                 <span className="following__title">Publicaciones</span>
//                 <span className="following__number">{publicationsCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <span className="following__title">Likes</span>
//               <span className="following__number">{likesTotal}</span>
//             </div>
//           </div>
//         </header>
//       ) : (
//         <p>Cargando datos del usuario...</p>
//       )}

//       {canViewPublications ? (
//         <PublicationList
//           publications={publications}
//           getPublications={getPublications}
//           page={page}
//           setPage={setPage}
//           more={more}
//           setMore={setMore}
//           // Importante: No pasamos "likes" local
//           handleLike={handleLike}
//           handleUnlike={handleUnlike}
//           userId={auth._id}
//         />
//       ) : (
//         <div className="icon-container">
//           <h1 className="UnRead">
//             <CiUnread />
//           </h1>
//           <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
//         </div>
//       )}
//     </>
//   );
// };

// import React, { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';

// import useAuth from './../../hooks/useAuth';
// import { Global } from '../../helpers/Global';
// import { getProfile } from './../../helpers/GetProfile';
// import Avatar from '../../assets/img/user.png';
// import { CiUnread } from 'react-icons/ci';

// // Importamos acciones
// import { setProfile } from '../../profileActions'; // { type: 'SET_PROFILE' }
// import { setPublications, likePublication, unlikePublication, followedUser, userUnfollowed } from '../../actions'; 
// // Ajusta segun tu arbol de acciones

// import { PublicationList } from '../publication/PublicationList';

// export const Profile = () => {
//   const dispatch = useDispatch();
//   const { auth } = useAuth(); // user logueado

//   // (1) Obtenemos del redux "profile" => userProfile y contadores
//   const { userProfile, followersCount, followingCount, publicationsCount, likesTotal } = useSelector((state) => state.profile);

//   // (2) Obtenemos las publicaciones del "publication" reducer
//   const publications = useSelector((state) => state.publication.publications);

//   // Locales
//   const [iFollow, setIFollow] = useState(false);
  
//   const [page, setPage] = useState(1);
//   const [more, setMore] = useState(true);
//   const [user, setUser] = useState({});
//   const params = useParams();
//   const userId = params.userId;

//   // Determina si el user logueado puede ver las publicaciones
//   const canViewPublications = iFollow || (auth._id === userId);

//   useEffect(() => {
//     if (userId) {
//       // 1) Cargar info (user + counters) en profileReducer
//       fetchProfileData();
//       // 2) Cargar publicaciones en publication reducer
//       getPublications(1, true);
//     }
//   }, [userId]);

//   // ---------------------------------
//   //    FUNCIONES PRINCIPALES
//   // ---------------------------------

//   // (A) Cargar data del perfil + contadores en profileReducer
//   const fetchProfileData = async () => {
//     try {
//       // 1) Info del user
//       const dataUser = await getProfile(userId); // tu helper
//       setUser(dataUser.usuario);
//       // 2) Info de contadores
//       const countersRes = await fetch(Global.url + 'user/counters/' + userId, {
//         method: 'GET',
//         headers: {
//           Authorization: localStorage.getItem('token')
//         }
//       });
//       const countersData = await countersRes.json();

//       // (CAMBIO) guardamos en el profileReducer
//       dispatch(setProfile(dataUser.usuario, countersData));

//       // Chequear si el user logueado lo sigue
//       if (dataUser.following && dataUser.following._id) {
//         setIFollow(true);
//       } else {
//         setIFollow(false);
//       }
//     } catch (error) {
//       console.error('Error fetching profile data:', error);
//     }
//   };

//   // (B) Cargar publicaciones y guardarlas en redux (publication slice)
//   const getPublications = async (nextPage = 1, reset = false) => {
//     try {
//       const res = await fetch(Global.url + 'publication/listp/' + userId + '/' + nextPage, {
//         headers: {
//           Authorization: localStorage.getItem('token'),
//         }
//       });
//       const data = await res.json();
//       if (data.status === 'success') {
//         let newPubs = data.publications;
//         if (!reset && publications.length > 0) {
//           newPubs = [...publications, ...newPubs];
//         }
//         dispatch(setPublications(newPubs));

//         // Manejo local de "likes"
//         // const newLikes = {};
//         // newPubs.forEach((pub) => {
//         //   newLikes[pub._id] = pub.likes.includes(auth._id);
//         // });
//         // setLikes((prev) => ({ ...prev, ...newLikes }));

//         setPage(data.page);
//         if (data.page >= data.pages) {
//           setMore(false);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching publications:', error);
//     }
//   };

  
//     const handleLike = async (publicationId) => {
//       try {
//         const response = await fetch(Global.url + `publication/like/${publicationId}`, {
//           method: 'POST',
//           headers: {
//             'Authorization': localStorage.getItem('token'),
//           },
//         });
//         const data = await response.json();
  
//         if (data.status === 'success') {
//           // // Actualizar estado local
//           // setLikes((prev) => ({ ...prev, [publicationId]: true }));
//           // Despachar acción a Redux (y opcionalmente socketMiddleware)
//           dispatch(likePublication(publicationId, auth._id));
//         }
//       } catch (error) {
//         console.error('Error al dar like:', error);
//       }
//     };
  
//   // const handleLike = async (publicationId) => {
//   //   try {
//   //     const response = await fetch(Global.url + `publication/like/${publicationId}`, {
//   //       method: 'POST',
//   //       headers: {
//   //         Authorization: localStorage.getItem('token'),
//   //       },
//   //     });
//   //     const data = await response.json();
//   //     if (data.status === 'success') {
//   //       // Actualizamos local
//   //       setLikes((prev) => ({ ...prev, [publicationId]: true }));
//   //       // Despachamos para que redux+socketMid se enteren si quieres (likePublication)
//   //       dispatch(likePublication(publicationId, auth._id));
//   //     }
//   //   } catch (error) {
//   //     console.error('Error al dar like:', error);
//   //   }
//   // };
//  const handleUnlike = async (publicationId) => {
//     try {
//       const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': localStorage.getItem('token'),
//         },
//       });
//       const data = await response.json();

//       if (data.status === 'success') {
//         // // Actualizar estado local
//         // setLikes((prev) => ({ ...prev, [publicationId]: false }));
//         // Despachar acción a Redux
//         dispatch(unlikePublication(publicationId, auth._id));
//       }
//     } catch (error) {
//       console.error('Error al quitar like:', error);
//     }
//   };
//   // const handleUnlike = async (publicationId) => {
//   //   try {
//   //     const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
//   //       method: 'POST',
//   //       headers: {
//   //         Authorization: localStorage.getItem('token'),
//   //       },
//   //     });
//   //     const data = await response.json();
//   //     if (data.status === 'success') {
//   //       setLikes((prev) => ({ ...prev, [publicationId]: false }));
//   //       dispatch(unlikePublication(publicationId, auth._id));
//   //     }
//   //   } catch (error) {
//   //     console.error('Error al quitar like:', error);
//   //   }
//   // };

//   // (D) Manejar follow/unfollow
//   const follow = async (userIdToFollow) => {
//     try {
//       const response = await fetch(Global.url + 'follow/save', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: localStorage.getItem('token'),
//         },
//         body: JSON.stringify({ followed: userIdToFollow })
//       });
//       const data = await response.json();
//       if (data.status === 'success') {
//         setIFollow(true);
//         // Despachamos algo si queremos notificar socket
//         dispatch(followedUser(userIdToFollow));
//       }
//     } catch (error) {
//       console.error('Error al hacer follow:', error);
//     }
//   };

//   const unFollow = async (userIdToUnfollow) => {
//     try {
//       const response = await fetch(Global.url + 'follow/unfollow/' + userIdToUnfollow, {
//       method: 'DELETE',
//       headers: {
//         Authorization: localStorage.getItem('token'),
//       }});
//       const data = await response.json();
//       if (data.status === 'success') {
//         setIFollow(false);
//         dispatch(userUnfollowed(userIdToUnfollow));
//       }
//     } catch (error) {
//       console.error('Error al hacer unfollow:', error);
//     }
//   };

//   // Render final
//   return (
//     <>
//       {/* CABECERA DEL PERFIL */}
//       {userProfile ? (
//         <header className="aside__profile-info">
//           <div className="profile-info__general-info">
//             <div className="general-info__container-avatar">
//               {userProfile.imagen !== 'default.png' ? (
//                 <img
//                   src={Global.url + 'user/avatar/' + userProfile.imagen}
//                   className="container-avatar__img"
//                   alt="Foto de perfil"
//                 />
//               ) : (
//                 <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
//               )}
//             </div>

//             <div className="general-info__container-names">
//               <h1>{userProfile.nick}</h1>
//               <h2>{userProfile.bio}</h2>
//               {userProfile._id !== auth._id && (
//                 iFollow ? (
//                   <button onClick={() => unFollow(userProfile._id)} className="content__button--red">
//                     Cancelar suscripción
//                   </button>
//                 ) : (
//                   <button onClick={() => follow(userProfile._id)} className="content__button content__button--rigth">
//                     Suscribirme
//                   </button>
//                 )
//               )}
//             </div>
//           </div>

//           {/* ESTADISTICAS DEL PERFIL (Redux) */}
//           <div className="profile-info__stats">
//             <div className="stats__following">
//               <Link to={'/social/siguiendo/' + userProfile._id} className="following__link">
//                 <span className="following__title">Siguiendo</span>
//                 <span className="following__number">{followingCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link to={'/social/seguidores/' + userProfile._id} className="following__link">
//                 <span className="following__title">Seguidores</span>
//                 <span className="following__number">{followersCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link to={'/social/perfil/' + userProfile._id} className="following__link">
//                 <span className="following__title">Publicaciones</span>
//                 <span className="following__number">{publicationsCount}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <span className="following__title">Likes</span>
//               <span className="following__number">{likesTotal}</span>
//             </div>
//           </div>
//         </header>
//       ) : (
//         <p>Cargando datos del usuario...</p>
//       )}

//       {/* LISTA DE PUBLICACIONES O MENSAJE */}
//       {canViewPublications ? (
//         <PublicationList
//           publications={publications}
//           getPublications={getPublications}
//           page={page}
//           setPage={setPage}
//           more={more}
//           setMore={setMore}
//          // likes={likes}
//           handleLike={handleLike}
//           handleUnlike={handleUnlike}
//         />
//       ) : (
//         <div className="icon-container">
//           <h1 className="UnRead"><CiUnread /></h1>
//           <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
//         </div>
//       )}
//     </>
//   );
// };
// import React, { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import useAuth from './../../hooks/useAuth';
// import { setPublications, likePublication, unlikePublication, followedUser, userUnfollowed, setCounters } from '../../actions';
// import { Global } from '../../helpers/Global';
// import { getProfile } from './../../helpers/GetProfile';
// import { PublicationList } from '../publication/PublicationList';
// import Avatar from '../../assets/img/user.png';
// import { CiUnread } from 'react-icons/ci';

// export const Profile = () => {
//   const { auth } = useAuth();
//   const dispatch = useDispatch();

//   // (Obtenemos "publications" de Redux
//   const publications = useSelector((state) => state.publication.publications);

//   // Obtenemos contadores globales de Redux (followersCount, followingCount, etc.)
//   const { followersCount, followingCount, publicationsCount, likesTotal } = useSelector((state) => state.user);

//   const [user, setUser] = useState({});
//   // const [counters, setCounters] = useState({
//   //   followers: 0,
//   //   following: 0,
//   //   publications: 0,
//   //   likesTotal: 0
//   // });
//   const [iFollow, setIFollow] = useState(false);
//   const [page, setPage] = useState(1);
//   const [more, setMore] = useState(true);
//   const [likes, setLikes] = useState({});

//   const params = useParams();
//   const canViewPublications = iFollow || auth._id === params.userId;

//   // Cargar datos al montar / cambiar param
//   useEffect(() => {
//     if (params.userId) {
//       getDataUser();
//       getCounters();
//       setMore(true);
//       getPublications(1, true);
//     }
//   }, [params.userId]);

//   const getDataUser = async () => {
//     const dataUser = await getProfile(params.userId, setUser);
//     if (dataUser.following && dataUser.following._id) {
//       setIFollow(true);
//     }
//   };
//   const getCounters = async () => {
//     try {
//       const request = await fetch(Global.url + "user/counters/" + params.userId, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": localStorage.getItem("token")
//         }
//       });
//       const data = await request.json();

//       // data => { followers, following, publications, likesTotal }
//       if (typeof data.followers !== "undefined") {
//         // Despachamos la acción 'SET_COUNTERS'
//         dispatch(setCounters(
//           data.followers,
//           data.following,
//           data.publications,
//           data.likesTotal
//         ));
//       }
//     } catch (error) {
//       console.error("Error fetching counters:", error);
//     }
//   };

//   // const getCounters = async () => {
//   //   try {
//   //     const request = await fetch(Global.url + "user/counters/" + params.userId, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         "Authorization": localStorage.getItem("token")
//   //       }
//   //     });
//   //     const data = await request.json();

//   //     // data => { followers, following, publications, likesTotal }
//   //     if (typeof data.followers !== "undefined") {
//   //       // Despachamos la acción 'SET_COUNTERS'
//   //       dispatch(setCounters(
//   //         data.followers,
//   //         data.following,
//   //         data.publications,
//   //         data.likesTotal
//   //       ));
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching counters:", error);
//   //   }
//   // };
//   // const getCounters = async () => {
//   //   const request = await fetch(Global.url + "user/counters/" + params.userId, {
//   //     method: "GET",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       "Authorization": localStorage.getItem("token")
//   //     }
//   //   });
//   //   const data = await request.json();
//   //   if (typeof data.followers !== "undefined") {
//   //     setCounters(data);
//   //   }
//   // };

//   const getPublications = async (nextPage = 1, newProfile = false) => {
//     const request = await fetch(
//       Global.url + "publication/listp/" + params.userId + "/" + nextPage,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": localStorage.getItem("token")
//         }
//       }
//     );
//     const data = await request.json();

//     if (data.status === "success") {
//       let newPublications = data.publications;

//       if (!newProfile && publications.length >= 1) {
//         newPublications = [...publications, ...data.publications];
//       }
//       if (newProfile) {
//         newPublications = data.publications;
//         setMore(true);
//         setPage(1);
//       }

//       // Despachamos la acción para guardarlas en Redux
//       dispatch(setPublications(newPublications));

//       // Manejo local de likes
//       const newLikes = {};
//       newPublications.forEach((publication) => {
//         newLikes[publication._id] = publication.likes.includes(auth._id);
//       });
//       setLikes(newLikes);

//       if (!newProfile && publications.length >= (data.total - data.publications.length)) {
//         setMore(false);
//       }
//       if (data.pages <= 1) {
//         setMore(false);
//       }
//     }
//   };

//   // Manejo de Like/Unlike
//   const handleLike = async (publicationId) => {
//     const response = await fetch(Global.url + `publication/like/${publicationId}`, {
//       method: 'POST',
//       headers: {
//         Authorization: localStorage.getItem("token"),
//       }
//     });
//     const data = await response.json();
//     if (data.status === 'success') {
//       setLikes((prev) => ({ ...prev, [publicationId]: true }));
//       // Despachamos la acción a Redux
//       dispatch(likePublication(publicationId, auth._id));
//     }
//   };

//   const handleUnlike = async (publicationId) => {
//     const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
//       method: 'POST',
//       headers: {
//         Authorization: localStorage.getItem("token"),
//       }
//     });
//     const data = await response.json();
//     if (data.status === 'success') {
//       setLikes((prev) => ({ ...prev, [publicationId]: false }));
//       // Despachamos la acción a Redux
//       dispatch(unlikePublication(publicationId, auth._id));
//     }
//   };

//   // Manejo de Follow/Unfollow
//   const follow = async (userId) => {
//     const response = await fetch(Global.url + "follow/save", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: localStorage.getItem("token")
//       },
//       body: JSON.stringify({ followed: userId })
//     });
//     const data = await response.json();
//     if (data.status === "success") {
//       setIFollow(true);
//       dispatch(followedUser(userId));
//     }
//   };

//   const unFollow = async (userId) => {
//     const response = await fetch(Global.url + "follow/unfollow/" + userId, {
//       method: "DELETE",
//       headers: {
//         Authorization: localStorage.getItem("token")
//       }
//     });
//     const data = await response.json();
//     if (data.status === "success") {
//       setIFollow(false);
//       dispatch(userUnfollowed(userId));
//     }
//   };
//   // const follow = async (userId) => {
//   //   const response = await fetch(Global.url + "follow/save", {
//   //     method: "POST",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       Authorization: localStorage.getItem("token")
//   //     },
//   //     body: JSON.stringify({ followed: userId })
//   //   });
//   //   const data = await response.json();
//   //   if (data.status === "success") {
//   //     setIFollow(true);
//   //     dispatch(followUser(userId));
//   //   }
//   // };

//   // const unFollow = async (userId) => {
//   //   const response = await fetch(Global.url + "follow/unfollow/" + userId, {
//   //     method: "DELETE",
//   //     headers: {
//   //       Authorization: localStorage.getItem("token")
//   //     }
//   //   });
//   //   const data = await response.json();
//   //   if (data.status === "success") {
//   //     setIFollow(false);
//   //     dispatch(unFollowUser(userId));
//   //   }
//   // };

//   return (
//     <>
//       {user && user._id ? (
//         <header className="aside__profile-info">
//           <div className="profile-info__general-info">
//             <div className="general-info__container-avatar">
//               {user.imagen !== "default.png" ? (
//                 <img
//                   src={Global.url + "user/avatar/" + user.imagen}
//                   className="container-avatar__img"
//                   alt="Foto de perfil"
//                 />
//               ) : (
//                 <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
//               )}
//             </div>

//             <div className="general-info__container-names">
//               <h1>{user.nick}</h1>
//               <h2>{user.bio}</h2>

//               {user._id !== auth._id && (
//                 iFollow ? (
//                   <button onClick={() => unFollow(user._id)} className="content__button--red">
//                     Cancelar suscripción
//                   </button>
//                 ) : (
//                   <button onClick={() => follow(user._id)} className="content__button content__button--rigth">
//                     Suscribirme
//                   </button>
//                 )
//               )}
//             </div>
//           </div>

//           {/* <div className="profile-info__stats">
//             <div className="stats__following">
//               <Link to={"/social/siguiendo/" + user._id} className="following__link">
//                 <span className="following__title">Siguiendo</span>
//                 <span className="following__number">{counters.following || 0}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link to={"/social/seguidores/" + user._id} className="following__link">
//                 <span className="following__title">Seguidores</span>
//                 <span className="following__number">{counters.followers || 0}</span>
//               </Link>
//             </div> */}
//             {/* <div className="stats__following">
//               <Link to={"/social/perfil/" + user._id} className="following__link">
//                 <span className="following__title">Publicaciones</span>
//                 <span className="following__number">{counters.publications || 0}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <span className="following__title">Likes</span>
//               <span className="following__number">{counters.likesTotal || 0}</span>
//             </div>
//           </div> */}
//               <div className="profile-info__stats">
//             <div className="stats__following">
//               <Link to={"/social/siguiendo/" + user._id} className="following__link">
//                 <span className="following__title">Siguiendo</span>
//                 <span className="following__number">{followingCount || 0}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link to={"/social/seguidores/" + user._id} className="following__link">
//                 <span className="following__title">Seguidores</span>
//                 <span className="following__number">{followersCount || 0}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <Link to={"/social/perfil/" + user._id} className="following__link">
//                 <span className="following__title">Publicaciones</span>
//                 <span className="following__number">{publicationsCount || 0}</span>
//               </Link>
//             </div>
//             <div className="stats__following">
//               <span className="following__title">Likes</span>
//               <span className="following__number">{likesTotal || 0}</span>
//             </div>
//           </div>
//         </header>
//       ) : (
//         <p>Cargando datos del usuario...</p>
//       )}

//       {canViewPublications ? (
//         <PublicationList
//           publications={publications}
//           getPublications={getPublications}
//           page={page}
//           setPage={setPage}
//           more={more}
//           setMore={setMore}
//           likes={likes}
//           handleLike={handleLike}
//           handleUnlike={handleUnlike}
//         />
//       ) : (
//         <div className="icon-container">
//           <h1 className="UnRead"><CiUnread /></h1>
//           <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
//         </div>
//       )}
//     </>
//   );
// };

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Global } from '../../helpers/Global';
// import useAuth from './../../hooks/useAuth';
// import { PublicationList } from '../publication/PublicationList';
// import { getProfile } from './../../helpers/GetProfile';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPublications } from '../../actions'; // Asegúrate de importar tus acciones

// export const Profile = () => {
//     const { auth } = useAuth();
//     const dispatch = useDispatch();
//     const publications = useSelector((state) => state.user.publications);
//     const [user, setUser ] = useState({});
//     const [counters, setCounters] = useState({
//         followers: 0,
//         following: 0,
//         publications: 0,
//         likesTotal: 0
//     });
//     const [iFollow, setIFollow] = useState(false);
//     const [page, setPage] = useState(1);
//     const [more, setMore] = useState(true);
//     const [likes, setLikes] = useState({}); // Estado para almacenar los likes de cada publicación
//     const params = useParams();

//     useEffect(() => {
//         if (params.userId) {
//             getDataUser ();
//             getCounters();
//             setMore(true);
//             getPublications(1, true);
//         }
//     }, [params.userId]);

//     const getDataUser  = async () => {
//         let dataUser  = await getProfile(params.userId, setUser );

//         if (dataUser .following && dataUser .following._id) {
//             setIFollow(true);
//         }
//     };

//     const getCounters = async () => {
//         const request = await fetch(Global.url + "user/counters/" + params.userId, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": localStorage.getItem("token")
//             }
//         });

//         const data = await request.json();
//         if (data.followers !== undefined) {
//             setCounters(data);
//         }
//     };

//     const getPublications = async (nextPage = 1, newProfile = false) => {
//         const request = await fetch(Global.url + "publication/listp/" + params.userId + "/" + nextPage, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": localStorage.getItem("token")
//             }
//         });

//         const data = await request.json();
//         if (data.status === "success") {
//             let newPublications = data.publications;

//             if (!newProfile && publications.length >= 1) {
//                 newPublications = [...publications, ...data.publications];
//             }
//             if (newProfile) {
//                 newPublications = data.publications;
//                 setMore(true);
//                 setPage(1);
//             }
//             dispatch(setPublications(newPublications));

//             // Actualizar el estado de los likes para cada publicación
//             const newLikes = {};
//             newPublications.forEach((publication) => {
//                 newLikes[publication._id] = publication.likes.includes(auth._id);
//             });
//             setLikes(newLikes);

//             if (!newProfile && publications.length >= (data.total - data.publications.length)) {
//                 setMore(false);
//             }
//             if (data.pages <= 1) {
//                 setMore(false);
//             }
//         }
//     };

//     const handleLike = async (publicationId) => {
//         const response = await fetch(Global.url + `publication/like/${publicationId}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': localStorage.getItem("token"),
//             }
//         });
//         const data = await response.json();

//         if (data.status === 'success') {
//             setLikes((prevLikes) => ({
//                 ...prevLikes,
//                 [publicationId]: true,
//             }));
//             // Aquí puedes despachar la acción para WebSocket
//             dispatch({ type: 'LIKE_PUBLICATION', payload: { publicationId } });
//         }
//     };

//     const handleUnlike = async (publicationId) => {
//         const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': localStorage.getItem("token"),
//             }
//         });
//         const data = await response.json();

//         if (data.status === 'success') {
//             setLikes((prevLikes) => ({
//                 ...prevLikes,
//                 [publicationId]: false,
//             }));
//             // Aquí puedes despachar la acción para WebSocket
//             dispatch({ type: 'UNLIKE_PUBLICATION', payload: { publicationId } });
//         }
//     };

//     return (
//         <>
//             {user && user._id ? (
//                 <header className="aside__profile-info">
//                     <div className="profile-info__general-info">
//                         <div className="general-info__container-avatar">
//                             {user.imagen !== "default.png" ? (
//                                 <img src={Global.url + "user/avatar/" + user.imagen} className="container-avatar__img" alt="Foto de perfil" />
//                             ) : (
//                                 <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
//                             )}
//                         </div>

//                         <div className="general-info__container-names">
//                             <h1>{user.nick}</h1>
//                             <h2>{user.bio}</h2>
//                             {user._id !== auth._id &&
//                                 (iFollow ? (
//                                     <button onClick={() => unFollow(user._id)} className="content__button--red">
//                                         Cancelar suscripción
//                                     </button>
//                                 ) : (
//                                     <button onClick={() => follow(user._id)} className="content__button content__button--rigth">
//                                         Suscribirme
//                                     </button>
//                                 ))}
//                         </div>
//                     </div>
//                     <div className="profile-info__stats">
//                     <div className="stats__following">
//                         <Link to={"/social/siguiendo/" + user._id} className="following__link">
//                             <span className="following__title">Siguiendo</span>
//                             <span className="following__number">{counters.following || 0}</span>
//                         </Link>
//                     </div>
//                     <div className="stats__following">
//                         <Link to={"/social/seguidores/" + user._id} className="following__link">
//                             <span className="following__title">Seguidores</span>
//                             <span className="following__number">{counters.followers || 0}</span>
//                         </Link>
//                     </div>
//                     <div className="stats__following">
//                         <Link to={"/social/perfil/" + user._id} className="following__link">
//                             <span className="following__title">Publicaciones</span>
//                             <span className="following__number">{counters.publications || 0}</span>
//                         </Link>
//                     </div>
//                     <div className="stats__following">
//                         <span className="following__title">Likes</span>
//                         <span className="following__number">{counters.likesTotal || 0}</span>
//                     </div>
//                 </div>
//                 </header>
//             ) : (
//                 <p>Cargando datos del usuario...</p>
//             )}

//             {canViewPublications ? (
//                 <PublicationList
//                     publications={publications}
//                     getPublications={getPublications}
//                     page={page}
//                     setPage={setPage}
//                     more={more}
//                     setMore={setMore}
//                     likes={likes}
//                     handleLike={handleLike}
//                     handleUnlike={handleUnlike}
//                 />
//             ) : (
//                 <div className="icon-container">
//                     <h1 className="UnRead">
//                         <CiUnread />
//                     </h1>
//                     <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
//                 </div>
//             )}
//         </>
//     );
// };
    
        
//     return (
//         <>
//             {user && user._id ? (
//                 <header className="aside__profile-info">
//                     <div className="profile-info__general-info">
//                         <div className="general-info__container-avatar">
//                             {user.imagen !== "default.png" ? (
//                                 <img src={Global.url + "user/avatar/" + user.imagen} className="container-avatar__img" alt="Foto de perfil" />
//                             ) : (
//                                 <img src={Avatar} className="container-avatar__img" alt="Foto de perfil" />
//                             )}
//                         </div>

//                         <div className="general-info__container-names">
//                             <h1>{user.nick}</h1>
//                             <h2>{user.bio}</h2>
//                             {user._id != auth._id &&
//                                 (iFollow ?
//                                     <button onClick={() => unFollow(user._id)} className=" content__button--red content__button--red:hover ">Cancelar suscripcion</button>
//                                     :
//                                     <button onClick={() => follow(user._id)} className="content__button content__button--rigth">Suscribirme</button>
//                                 )
//                             }
//                         </div>
//                     </div>

//                     <div className="profile-info__stats">
//                         <div className="stats__following">
//                             <Link to={"/social/siguiendo/" + user._id} className="following__link">
//                                 <span className="following__title">Siguiendo</span>
//                                 <span className="following__number">{counters.following >= 1 ? counters.following : 0}</span>
//                             </Link>
//                         </div>
//                         <div className="stats__following">
//                             <Link to={"/social/seguidores/" + user._id} className="following__link">
//                                 <span className="following__title">Seguidores</span>
//                                 <span className="following__number">{counters.followers >= 1 ? counters.followers : 0}</span>
//                             </Link>
//                         </div>
//                         <div className="stats__following">
//                             <Link to={"/social/perfil/" + user._id} className="following__link">
//                                 <span className="following__title">Publicaciones</span>
//                                 <span className="following__number">{counters.publications >= 1 ? counters.publications : 0}</span>
//                             </Link>
//                         </div>
//                         <div className="stats__following">
//                                 <span className="following__title">Likes </span>
//                                 <span className="following__number">{counters.likesTotal || 0}</span>
//                         </div>
//                     </div>
                   
//                 </header>
//             ) : (
//                 <p>Cargando datos del usuario...</p>
//             )}
//            {user && user._id ? (
//     user._id === auth._id || user.rol === "administrador" ? (
      
//         <PublicationList
//             publications={publications}
//             getPublications={getPublications}
//             page={page}
//             setPage={setPage}
//             more={more}
//             setMore={setMore}
//             likes={likes}
//             handleLike={handleLike}
//             handleUnlike={handleUnlike}
//         />
//     ) : (
       
//         iFollow ? (
//             <PublicationList 
//                 publications={publications}
//                 getPublications={getPublications}
//                 page={page}
//                 setPage={setPage}
//                 more={more}
//                 setMore={setMore}
//                 likes={likes}
//                 handleLike={handleLike}
//                 handleUnlike={handleUnlike}
//             />
//         ) : (
//             <div className="icon-container">
//                 <h1 className="UnRead"><CiUnread /></h1>
//                 <h2 className="msg">Debes estar suscripto para ver las publicaciones</h2>
//             </div>
//         ) 
//     )
// ) : (
//     <p>Espere por favor...</p>
// )}
                                
                    
//           <br />
//         </>
//     )
// }

   
        