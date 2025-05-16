const initialState = {
  publications: [],
};

export default function publicationReducer(state = initialState, action) {
  switch (action.type) {
    // Mantienes tus casos existentes
    case 'SET_PUBLICATIONS':
      return {
        ...state,
        publications: action.payload,
      };

    case 'PUBLICATION_CREATED':
      return {
        ...state,
        publications: [action.payload, ...state.publications],
      };

    case 'PUBLICATION_DELETED':
      return {
        ...state,
        publications: state.publications.filter(
          (p) => p._id !== action.payload.publicationId
        ),
      };

    // Cuando el USUARIO local hace like con handleLike -> dispatch(likePublication(...))
    case 'LIKE_PUBLICATION': {
      const { publicationId, userId } = action.payload;
      return {
        ...state,
        publications: state.publications.map((pub) => {
          if (pub._id === publicationId) {
            if (!pub.likes.includes(userId)) {
              return {
                ...pub,
                likes: [...pub.likes, userId],
              };
            }
          }
          return pub;
        }),
      };
    }

    // Cuando el USUARIO local hace unlike
    case 'UNLIKE_PUBLICATION': {
      const { publicationId, userId } = action.payload;
      return {
        ...state,
        publications: state.publications.map((pub) => {
          if (pub._id === publicationId) {
            return {
              ...pub,
              likes: pub.likes.filter((id) => id !== userId),
            };
          }
          return pub;
        }),
      };
    }

    // ++++ NUEVOS CASES ++++
    // Cuando CUALQUIER usuario (incluyendo el local) da like
    // y el servidor emite 'publicationLiked'
    case 'PUBLICATION_LIKED': {
      const { publicationId, userId } = action.payload;
      return {
        ...state,
        publications: state.publications.map((pub) => {
          if (pub._id === publicationId) {
            if (!pub.likes.includes(userId)) {
              return {
                ...pub,
                likes: [...pub.likes, userId],
              };
            }
          }
          return pub;
        }),
      };
    }

    // Cuando el servidor emite 'publicationUnliked'
    case 'PUBLICATION_UNLIKED': {
      const { publicationId, userId } = action.payload;
      return {
        ...state,
        publications: state.publications.map((pub) => {
          if (pub._id === publicationId) {
            return {
              ...pub,
              likes: pub.likes.filter((id) => id !== userId),
            };
          }
          return pub;
        }),
      };
    }

    default:
      return state;
  }
}