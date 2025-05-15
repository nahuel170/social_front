import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPublications, likePublication, unlikePublication } from '../../actions';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { PublicationList } from '../publication/PublicationList';

export const Feed = () => {
  const dispatch = useDispatch();
  const { auth } = useAuth();

  // Redux: publicaciones
  const publications = useSelector((state) => state.publication.publications);

  // Estados locales
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Carga inicial del feed
  useEffect(() => {
    const loadFeed = async () => {
      // 1) Limpiar lo anterior
      dispatch(setPublications([]));
      setPage(1);
      setMore(true);
      setLoading(true);

      // 2) Traer página 1
      await getPublications(1, true);

      // 3) Ya terminó
      setLoading(false);
    };
    loadFeed();
  }, [dispatch]);

  // Función para obtener publicaciones
  const getPublications = async (nextPage = 1, reset = false) => {
    try {
      const url = `${Global.url}publication/feed/${nextPage}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Ajusta según tu respuesta: aquí uso data.publications.docs
        let newPubs = data.publications.docs;

        if (!reset && publications.length) {
          newPubs = [...publications, ...newPubs];
        }

        dispatch(setPublications(newPubs));
        setPage(data.publications.page);

        if (data.publications.page >= data.publications.totalPages) {
          setMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  // Refrescar feed (Mostrar nuevas)
  const handleRefresh = async () => {
    dispatch(setPublications([]));
    setPage(1);
    setMore(true);
    setLoading(true);
    await getPublications(1, true);
    setLoading(false);
  };

  // Paginación
  const handleLoadMore = () => {
    const next = page + 1;
    getPublications(next);
  };

  // Likes
  const handleLike = (id) => {
    dispatch(likePublication(id, auth._id));
    fetch(`${Global.url}publication/like/${id}`, {
      method: 'POST',
      headers: { Authorization: localStorage.getItem('token') },
    }).catch(console.error);
  };
  const handleUnlike = (id) => {
    dispatch(unlikePublication(id, auth._id));
    fetch(`${Global.url}publication/unlike/${id}`, {
      method: 'POST',
      headers: { Authorization: localStorage.getItem('token') },
    }).catch(console.error);
  };

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Timeline</h1>
        <button className="content__button" onClick={handleRefresh}>
          Mostrar nuevas
        </button>
      </header>

      {loading ? (
        <p>Cargando feed…</p>
      ) : (
        <>
          <PublicationList
            publications={publications}
            getPublications={handleLoadMore}
            page={page}
            setPage={setPage}
            more={more}
            setMore={setMore}
            handleLike={handleLike}
            handleUnlike={handleUnlike}
            userId={auth._id}
          />

          {more && (
            <div className="content__container-btn">
              <button className="content__btn-more-post" onClick={handleLoadMore}>
                Ver más publicaciones
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPublications, likePublication, unlikePublication } from '../../actions';
// // ^ Ajusta los imports según cómo estructuraste tus action creators
// import { Global } from '../../helpers/Global';
// import useAuth from './../../hooks/useAuth';
// import { PublicationList } from '../publication/PublicationList';

// export const Feed = () => {
//   const dispatch = useDispatch();
//   const { auth } = useAuth();

//   // Obtenemos publicaciones desde Redux (ej. del publicationReducer)
//   const publications = useSelector((state) => state.publication.publications);

//   // Estados locales
//   const [page, setPage] = useState(1);
//   const [more, setMore] = useState(true);
 
//   useEffect(() => {
//     // Al montar el componente (o si cambia algo), cargamos el feed
//     getPublications(1, true);
//   }, []);

//   // 1) Cargar publicaciones (feed)
//   const getPublications = async (nextPage = 1, reset = false) => {
//     try {
//       const url = `${Global.url}publication/feed/${nextPage}`;
//       const request = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': localStorage.getItem('token'),
//         },
//       });
//       const data = await request.json();

//       if (data.status === 'success') {
//         let newPublications = data.publications.docs; // Ajusta según tu paginación

//         // Si no quieres resetear, concatenas
//         // Si "reset" es true, reemplazas el array
//         if (!reset && publications.length > 0) {
//           newPublications = [...publications, ...newPublications];
//         }

//         // Guardamos en Redux
//         dispatch(setPublications(newPublications));

//         // // Manejo local de likes para cada publicación
//         // const newLikes = {};
//         // newPublications.forEach((pub) => {
//         //   newLikes[pub._id] = pub.likes.includes(auth._id);
//         // });
//         // setLikes((prevLikes) => ({ ...prevLikes, ...newLikes }));

//         // Controlar botón "Ver más"
//         // data.publications.totalDocs, data.publications.docs.length, etc.
//         if (data.publications.page >= data.publications.totalPages) {
//           setMore(false);
//         } else {
//           setMore(true);
//         }
//         setPage(data.publications.page);
//       }
//     } catch (error) {
//       console.error('Error fetching feed:', error);
//     }
//   };

//   // 2) Manejar like
//   const handleLike = async (publicationId) => {
//     try {
//       const response = await fetch(Global.url + `publication/like/${publicationId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': localStorage.getItem('token'),
//         },
//       });
//       const data = await response.json();

//       if (data.status === 'success') {
//         // // Actualizar estado local
//         // setLikes((prev) => ({ ...prev, [publicationId]: true }));
//         // Despachar acción a Redux (y opcionalmente socketMiddleware)
//         dispatch(likePublication(publicationId, auth._id));
//       }
//     } catch (error) {
//       console.error('Error al dar like:', error);
//     }
//   };

//   // 3) Manejar unlike
//   const handleUnlike = async (publicationId) => {
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

//   // 4) Manejar paginación (Ver más)
//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     getPublications(nextPage);
//   };

//   return (
//     <>
//       <header className="content__header">
//         <h1 className="content__title">Timeline</h1>
//         <button
//           className="content__button"
//           onClick={() => getPublications(1, true)}
//         >
//           Mostrar nuevas
//         </button>
//       </header>

//       <PublicationList
//         publications={publications}
//         page={page}
//         setPage={setPage}
//         more={more}
//         setMore={setMore}
//         // likes={likes}
//         handleLike={handleLike}
//         handleUnlike={handleUnlike}
//         getPublications={getPublications}
//         userId={auth._id}
//       />

//       {more && (
//         <div className="content__container-btn">
//           {/* <button
//             className="content__btn-more-post"
//             onClick={handleLoadMore}
//           >
//             Ver más publicaciones
//           </button> */}
//         </div>
//       )}
//     </>
//   );
// };

// import React, { useEffect, useState } from 'react';
    // import Avatar from '../../assets/img/user.png';
    // import { useParams } from 'react-router-dom';
    // import { Global } from '../../helpers/Global';
    // import { Link } from 'react-router-dom';
    //             import useAuth from './../../hooks/useAuth';
    //             import { PublicationList } from '../publication/PublicationList';
    //             import { getProfile } from './../../helpers/GetProfile';
                
    //             export const Feed = () => {
    //                 const { auth } = useAuth();
                    
    //                 const [publications, setPublications] = useState([]);
    //                 const [page, setPage] = useState(1);
    //                 const [more, setMore] = useState(true);
    //                 const [likes, setLikes] = useState({}); // Estado para almacenar los likes de cada publicación
                
    //                 const params = useParams();
                
    //                 useEffect(() => {
    //                     if ( auth._id) {
                            
    //                         setMore(true);
    //                         getPublications(1, false);
    //                     }
    //                 }, [auth, params.userId]);
                   
    //                 const getPublications = async (nextPage = 1, showNews = false) => {
    //                     if (showNews) {
    //                         setPublications([]);
    //                         setPage(1);
    //                         nextPage = 1;
    //                     }
    //                     const request = await fetch(Global.url + "publication/feed/" + nextPage, {
    //                         method: "GET",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                             "Authorization": localStorage.getItem("token")
    //                         }
    //                     });
                
    //                     const data = await request.json();
    //                     console.log("Publications data feed:", data);
                
    //                     if (data.status === "success") {
    //                         let newPublications = data.publications.docs;
                
    //                         if (!showNews && publications.length >= 1) {
    //                             newPublications = [...publications, ...data.publications.docs];
    //                         }
                
    //                         setPublications(newPublications);
                
    //                         // Actualizar el estado de los likes para cada publicación
    //                         const newLikes = {};
    //                         newPublications.forEach((publication) => {
    //                             newLikes[publication._id] = publication.likes.includes(auth._id);
    //                         });
    //                         setLikes(newLikes);
                
    //                         if (!showNews && publications.length >= (data.total - data.publications.docs.length)) {
    //                             setMore(false);
    //                         }
    //                         if (data.pages <= 1) {
    //                             setMore(false);
    //                         }
    //                     }
    //                 };
                
    //                 const handleLike = async (publicationId) => {
    //                     // Lógica para dar like a una publicación
    //                     const response = await fetch(Global.url + `publication/like/${publicationId}`, {
    //                         method: 'POST',
    //                         headers: {
    //                             'Authorization': localStorage.getItem("token"),
    //                         }
    //                     });
    //                     const data = await response.json();
                
    //                     if (data.status === 'success') {
    //                         setLikes((prevLikes) => ({
    //                             ...prevLikes,
    //                             [publicationId]: true,
    //                         }));
    //                     }
    //                 };
                
    //                 const handleUnlike = async (publicationId) => {
    //                     // Lógica para quitar el like de una publicación
    //                     const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
    //                             method: 'POST',
    //                         headers: {
    //                                 'Authorization': localStorage.getItem("token"),
    //                         }
    //                     });
    //                     const data = await response.json();
                
    //                     if (data.status === 'success') {
    //                         setLikes((prevLikes) => ({
    //                             ...prevLikes,
    //                             [publicationId]: false,
    //                         }));
    //                     }
    //                 };
    //             return (
    //                 <>
    //                         <header className="content__header">
    //                             <h1 className="content__title">Timeline</h1>
    //                             <button className="content__button" onClick={() => getPublications(1, true)}>Mostrar nuevas</button>
    //                         </header>
                
    //                         <PublicationList
    //                             publications={publications}
    //                             getPublications={getPublications}
    //                             page={page}
    //                             setPage={setPage}
    //                             more={more}
    //                             setMore={setMore}
    //                             likes={likes} // Pasamos los likes como prop
    //                             handleLike={handleLike}
    //                             handleUnlike={handleUnlike}
    //                         />
    //                     </>
    //                 );
    //             };