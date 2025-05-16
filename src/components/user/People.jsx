import React, { useEffect, useState } from 'react'
import { Global } from '../../helpers/Global';
import { UserList } from './UserList';

export const People = () => {

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  const [more, setMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    getUsers();

  }, [page]);

  const getUsers = async () => {
    setLoading(true);

    const request = await fetch(Global.url + "user/list/" + page, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
      },
    });
    const data = await request.json();

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
        <h1 className="content__title">Gente</h1>
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
      //  counters={counters}
      //  setCounters={setCounters}


      />
    </>
  );
};