import React, { useEffect, useState } from 'react'
import { Global } from '../../helpers/Global';
import { UserList } from '../user/UserList';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../helpers/GetProfile';

export const Followers = () => {

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({});

  const params = useParams();

  useEffect(() => {
    getUsers();
    getProfile(params.userId, setUserProfile);
  }, [page]);

  const getUsers = async () => {
    setLoading(true);

    const userId = params.userId;

    const request = await fetch(Global.url + "follow/followers/" + userId + "/" + page, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
      },
    });
    const data = await request.json();

    let cleanUsers = [];

    data.follows.forEach(follow => {
      cleanUsers = [...cleanUsers, follow.user]
    });
    data.users = cleanUsers;
    console.log(data.users);

    if (data.users && data.status === "success") {
      let newUsers = data.users.map((user) => ({
        ...user,
        isFollowing: data.user_following.includes(user._id),
      }));

      if (users.length > 0) {
        newUsers = [...users, ...newUsers];
      }

      setUsers(newUsers);
      setFollowing(data.user_following);
      setLoading(false);

      if (users.length >= data.total - data.users.length) {
        setMore(false);
      }
    }
  };

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Seguidores de {userProfile.nick} </h1>
      </header>

      <UserList
        users={users}
        getUsers={getUsers}
        setUsers={setUsers}
        following={following}
        setFollowing={setFollowing}
        page={page}
        setPage={setPage}
        more={more}
        loading={loading}
      />
    </>
  );
};