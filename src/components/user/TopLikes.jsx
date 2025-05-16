import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import Avatar from '../../assets/img/user.png';
import { fetchTopLikes } from '../../topLikesActions';
import { FaFire } from 'react-icons/fa';

export const TopLikes = () => {
  const dispatch = useDispatch();
  // Aseguramos que si state.topLikes es null/undefined, tengamos siempre un array
  const topUsers = useSelector((state) => state.topLikes) || [];

  useEffect(() => {
    dispatch(fetchTopLikes());
    const interval = setInterval(() => dispatch(fetchTopLikes()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Si no hay usuarios válidos, mostramos un fallback
  const validUsers = topUsers.filter((u) => u && u._id && u._id._id);

  return (
    <aside className="top-likes">
      <h2>Top 10 Usuarios con más Likes</h2>
      {validUsers.length > 0 ? (
        <ol>
          {validUsers.map((userObj, index) => {
            const { _id: info } = userObj;
            const avatarUrl = info.imagen
              ? `${Global.url}user/avatar/${info.imagen}`
              : Avatar;

            return (
              <li key={info._id} className="top-likes-item">
                <span className="rank-number">{index + 1}.</span>
                <Link to={`/social/perfil/${info._id}`} className="top-likes-link">
                  <img
                    src={avatarUrl}
                    alt={info.nombre}
                    className="avatar"
                    title={`${info.nombre} (@${info.nick})`}
                    onError={(e) => { e.target.onerror = null; e.target.src = Avatar; }}
                  />
                  <span className="likes-count">{userObj.totalLikes} Likes</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p>No hay usuarios con likes para mostrar <FaFire className="icon-liked" /></p>
      )}
    </aside>
  );
};