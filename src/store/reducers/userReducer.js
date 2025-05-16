const initialState = {
  user: null,    // info del usuario logueado
  token: null,   // token si manejas auth
  followersCount: 0,    // cuántos lo siguen
  followingCount: 0,    // cuántos sigue
  likesTotal: 0,        // cuantos likes
  publicationsCount: 0, // cuantas publicaciones
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };

    case 'SET_COUNTERS': {
      const { followersCount, followingCount, publicationsCount, likesTotal } = action.payload;
      return {
        ...state,
        followersCount,
        followingCount,
        publicationsCount,
        likesTotal
      };
    }

    case 'USER_FOLLOWED': {
      const { followerId, followedId } = action.payload;
      // Si soy el seguido
      if (state.user && state.user._id === followedId) {
        return {
          ...state,
          followersCount: state.followersCount + 1,
        };
      }
      // Si soy el que sigue
      if (state.user && state.user._id === followerId) {
        return {
          ...state,
          followingCount: state.followingCount + 1,
        };
      }
      return state;
    }

    case 'USER_UNFOLLOWED': {
      const { followerId, unfollowedId } = action.payload;
      // Si soy el que fue "unfollowed"
      if (state.user && state.user._id === unfollowedId) {
        return {
          ...state,
          followersCount: state.followersCount - 1,
        };
      }
      // Si soy el que dejó de seguir
      if (state.user && state.user._id === followerId) {
        return {
          ...state,
          followingCount: state.followingCount - 1,
        };
      }
      return state;
    }
    case 'PUBLICATION_LIKED': {
      const { authorId } = action.payload;
      // Si YO soy el autor
      if (state.user && state.user._id === authorId) {
        return {
          ...state,
          likesTotal: state.likesTotal + 1,
        };
      }
      return state;
    }

    case 'PUBLICATION_UNLIKED': {
      const { authorId } = action.payload;
      if (state.user && state.user._id === authorId) {
        return {
          ...state,
          likesTotal: state.likesTotal - 1,
        };
      }
      return state;
    }

    default:
      return state;
  }
}