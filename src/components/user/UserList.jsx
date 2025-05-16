import React from 'react'
import Avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import useAuth from './../../hooks/useAuth';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';



export const UserList = ({ users, setUsers, getUsers, following, setFollowing,
    page, setPage, more, loading }) => {


    const { auth } = useAuth();

    const nextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };
    const follow = async (userId) => {
        try {
            const request = await fetch(Global.url + "follow/save", {
                method: "POST",
                body: JSON.stringify({ followed: userId }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token"),
                },
            });

            const data = await request.json();

            if (data.status === "success") {
                setFollowing((prevFollowing) => [...prevFollowing, userId]);

                // Actualizar el estado de users directamente
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId ? { ...user, isFollowing: true } : user
                    )
                );
            }
        } catch (error) {
            console.error("Error al seguir al usuario:", error);
        }
    };

    const unFollow = async (userId) => {
        try {
            const request = await fetch(Global.url + "follow/unfollow/" + userId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token"),
                },
            });

            const data = await request.json();

            if (data.status === "success") {
                setFollowing((prevFollowing) =>
                    prevFollowing.filter((id) => id !== userId)
                );

                // Actualizar el estado de users directamente
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId ? { ...user, isFollowing: false } : user
                    )
                );
            }
        } catch (error) {
            console.error("Error al dejar de seguir al usuario:", error);
        }
    };

    return (
        <>
            <div className="content__posts">
                {users.map((user) => (
                    <article className="posts__post" key={user._id}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + user._id} className="post__image-link">
                                    {user.imagen !== "default.png" ? (
                                        <img
                                            src={Global.url + "user/avatar/" + user.imagen}
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
                                    <Link to={"/social/perfil/" + user._id} className="user-info__name">{user.nick}</Link>
                                    <span className="user-info__divider"> | </span>
                                    <a href="#" className="user-info__create-date"><ReactTimeAgo date={user.created_at} locale="es-ES" /></a>
                                    <div className="profile-info__stats">
                                    </div>

                                    <div className="profile-info__stats">

                                        {/* <div className="stats__following">
                            <Link to={"/social/seguidores/" + user._id} className="following__link">
                                <span className="following__title">Seguidores</span>
                                <span className="following__number">{counters.followers >= 1 ? counters.followers : 0}</span>
                            </Link>
                        </div>
                        <div className="stats__following">
                            <Link to={"/social/perfil/" + user._id} className="following__link">
                                <span className="following__title">Publicaciones</span>
                                <span className="following__number">{counters.publications >= 1 ? counters.publications : 0}</span>
                            </Link>
                        </div>
                        <div className="stats__following">
                                <span className="following__title">Likes </span>
                                <span className="following__number">{counters.likesTotal || 0}</span>
                        </div> */}
                                    </div>
                                </div>

                                <h4 className="post__content">{user.bio}</h4>
                            </div>
                        </div>

                        {user._id != auth._id &&
                            <div className="post__buttons">
                                {!user.isFollowing ? (
                                    <a
                                        className="post__button post__button--green"
                                        onClick={() => follow(user._id)}
                                    >
                                        Suscribirme
                                    </a>
                                ) : (
                                    <a
                                        className="post__button"
                                        onClick={() => unFollow(user._id)}
                                    >
                                        Cancelar suscripción
                                    </a>
                                )}
                            </div>
                        }
                    </article>
                ))}
            </div>
            {loading && <div>Cargando...</div>}

            {more && (
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={nextPage}>
                        Ver más gente
                    </button>
                </div>
            )}
            <br />
        </>
    )
}