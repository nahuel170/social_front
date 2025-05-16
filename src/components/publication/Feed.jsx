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
      //  Limpiar lo anterior
      dispatch(setPublications([]));
      setPage(1);
      setMore(true);
      setLoading(true);

      //  Traer página 1
      await getPublications(1, true);

      //  Ya terminó
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