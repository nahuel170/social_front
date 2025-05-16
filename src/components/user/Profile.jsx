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

  //  Cargar perfil y contadores
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

  // Cargar publicaciones
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

  // Like / Unlike
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

  //  Follow / Unfollow
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