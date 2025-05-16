const initialState = {
  userProfile: null,
  followersCount: 0,
  followingCount: 0,
  publicationsCount: 0,
  likesTotal: 0
};

export default function profileReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_PROFILE': {
      // Recibe datos del servidor (user, contadores, etc.)
      // y los guarda en profileReducer
      const { user, counters } = action.payload;
      return {
        ...state,
        userProfile: user,
        followersCount: counters.followers || 0,
        followingCount: counters.following || 0,
        publicationsCount: counters.publications || 0,
        likesTotal: counters.likesTotal || 0,
      };
    }

    case 'PROFILE_USER_FOLLOWED': {
      const { followerId, followedId } = action.payload;
      // +1 a followersCount si userProfile es “followedId”
      if (state.userProfile && state.userProfile._id === followedId) {
        return {
          ...state,
          followersCount: state.followersCount + 1
        };
      }
      // +1 a followingCount si userProfile es “followerId”
      if (state.userProfile && state.userProfile._id === followerId) {
        return {
          ...state,
          followingCount: state.followingCount + 1
        };
      }
      return state;
    }

    case 'PROFILE_USER_UNFOLLOWED': {
      const { followerId, unfollowedId } = action.payload;
      // -1 a followersCount si userProfile es “unfollowedId”
      if (state.userProfile && state.userProfile._id === unfollowedId) {
        return {
          ...state,
          followersCount: state.followersCount - 1,
        };
      }
      // -1 a followingCount si userProfile es “followerId”
      if (state.userProfile && state.userProfile._id === followerId) {
        return {
          ...state,
          followingCount: state.followingCount - 1
        };
      }
      return state;
    }
    case 'PUBLICATION_LIKED': {
      const { authorId } = action.payload;
      // Si el perfil que veo es el autor de la publicación
      if (state.userProfile && state.userProfile._id === authorId) {
        return {
          ...state,
          likesTotal: state.likesTotal + 1
        };
      }
      return state;
    }

    case 'PUBLICATION_UNLIKED': {
      const { authorId } = action.payload;
      if (state.userProfile && state.userProfile._id === authorId) {
        return {
          ...state,
          likesTotal: state.likesTotal - 1
        };
      }
      return state;
    }

    default:
      return state;
  }
}