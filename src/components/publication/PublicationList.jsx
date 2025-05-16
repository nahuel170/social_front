import React from 'react'
import { Global } from '../../helpers/Global';
import { Link } from 'react-router-dom';
import useAuth from './../../hooks/useAuth';
import Avatar from '../../assets/img/user.png'
import ReactTimeAgo from 'react-time-ago';
import { FaFire } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setPublications, likePublication, unlikePublication } from '../../actions';


export const PublicationList = ({ publications, getPublications, page,
    setPage, more, setMore, userId, }) => {

    const dispatch = useDispatch();
    const { auth } = useAuth();

    const nextPage = async () => {
        let next = page + 1;
        setPage(next);
        getPublications(next);
    }
    const deletePublication = async (publicationId) => {
        const request = await fetch(Global.url + "publication/deleted/" + publicationId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        getPublications(1, true);
        setPage(1);
        setMore(true);
    }
    const handleLike = async (publicationId) => {
        try {
            const response = await fetch(Global.url + `publication/like/${publicationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            const data = await response.json();

            if (data.status === 'success') {
                // // Actualizar estado local
                // setLikes((prev) => ({ ...prev, [publicationId]: true }));
                // Despachar acción a Redux (y opcionalmente socketMiddleware)
                dispatch(likePublication(publicationId, auth._id));
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    };

    //Manejar unlike
    const handleUnlike = async (publicationId) => {
        try {
            const response = await fetch(Global.url + `publication/unlike/${publicationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            const data = await response.json();

            if (data.status === 'success') {
                // // Actualizar estado local
                // setLikes((prev) => ({ ...prev, [publicationId]: false }));
                // Despachar acción a Redux
                dispatch(unlikePublication(publicationId, auth._id));
            }
        } catch (error) {
            console.error('Error al quitar like:', error);
        }
    };
    return (
        <>
            <div className="content__posts">

                {publications.map(publication => {
                    const isLiked = publication.likes?.includes(userId);
                    // if (!publication.user) {
                    //     return (
                    //       <article key={publication._id}>
                    //         <p>Usuario no disponible</p>
                    //       </article>
                    //     );
                    //   }
                    return (
                        <article className="posts__post" key={publication._id}>

                            <div className="post__container">

                                <div className="post__image-user">
                                    <Link to={"/social/perfil/" + publication.user._id} className="post__image-link">
                                        {publication.user.imagen !== "default.png" ? (
                                            <img
                                                src={Global.url + "user/avatar/" + publication.user.imagen}
                                                className="post__user-image"
                                                alt="Foto de perfil"
                                            />
                                        ) : (
                                            <img src={Avatar} className="post__user-image" alt="Foto de perfil" />
                                        )}
                                    </Link>
                                </div>

                                <div className="post__body">

                                    <div className="post__user-info">
                                        <a href="#" className="user-info__name">{publication.user.nick}</a>
                                        <span className="user-info__divider"> | </span>
                                        <a href="#" className="user-info__create-date"><ReactTimeAgo date={publication.created_at} locale="es-ES" /></a>
                                    </div>

                                    <h4 className="post__content">{publication.text}</h4>
                                    {publication.file && (
                                        <img
                                            src={Global.url + "publication/media/" + publication.file}
                                            alt="Publicación"
                                            className="post__image"
                                        />
                                    )}
                                    {/* Contador de likes */}
                                    <p>{publication.likes.length} me gusta</p>

                                    {/* Botón de like/unlike */}
                                    {!isLiked ? (
                                        <button
                                            className="like-button"
                                            onClick={() => handleLike(publication._id)}
                                        >
                                            <FaFire className="icon-unliked" />
                                        </button>
                                    ) : (
                                        <button
                                            className="like-button"
                                            onClick={() => handleUnlike(publication._id)}
                                        >
                                            <FaFire className="icon-liked" />
                                        </button>
                                    )}

                                </div>

                            </div>

                            {auth._id === publication.user._id &&
                                <div className="post__buttons">

                                    <button onClick={() => deletePublication(publication._id)} className="post__button">
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>

                                </div>
                            }
                        </article>
                    );
                })
                }
            </div>

            {more &&
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={nextPage}>
                        Ver mas publicaciones
                    </button>
                </div>
            }
        </>
    )
}