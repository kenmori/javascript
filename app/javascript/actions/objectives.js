import { createActions } from 'redux-actions';
import actionTypes from '../constants/actionTypes';

const actions = createActions({
  [actionTypes.FETCH_OBJECTIVES]: () => {},
  [actionTypes.FETCHED_OBJECTIVES]: (objectives) => ({ objectives }),
  [actionTypes.ADD_OBJECTIVE]:  (objective, isOpenKeyResultModal) => ({ objective: objective, isOpenKeyResultModal }),
  [actionTypes.ADDED_OBJECTIVE]: objective => ({ objective }),
  [actionTypes.UPDATE_OBJECTIVE]: (objective) => ({ objective }),
  [actionTypes.UPDATED_OBJECTIVE]: objective => ({ objective }),
  [actionTypes.REMOVE_OBJECTIVE]: (id) => ({ id }),
  [actionTypes.REMOVED_OBJECTIVE]: (id) => ({ id }),
});

export default actions;