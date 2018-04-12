import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import ActionTypes from '../constants/actionTypes';

function add(state, objectiveId) {
  return state.update('ids', ids => ids.includes(objectiveId) ? ids : ids.insert(0, objectiveId));
}

function remove(state, objectiveId) {
  return state.update('ids', ids => ids.filter(id => id !== objectiveId));
}

function addToAll(state, objectiveId) {
  return state.update('allIds', ids => ids.insert(0, objectiveId));
}

function removeFromAll(state, objectiveId) {
  return state.update('allIds', ids => ids.filter(id => id !== objectiveId));
}

export default handleActions({
    [ActionTypes.FETCHED_OBJECTIVE]: (state, { payload }) => {
      const objectiveId = payload.get('result').first();
      return state.set('fetchedObjective', objectiveId);
    },
    [ActionTypes.FETCH_OBJECTIVES]: (state, { payload }) => {
      return state.set('isFetchedObjectives', false);
    },
    [ActionTypes.FETCHED_OBJECTIVES]: (state, { payload }) => {
      return state.set('ids', payload.get('result')).set('isFetchedObjectives', true);
    },
    [ActionTypes.FETCH_ALL_OBJECTIVES]: (state, { payload }) => {
      return state.set('isFetchedAllObjectives', false);
    },
    [ActionTypes.FETCHED_ALL_OBJECTIVES]: (state, { payload }) => {
      return state.set('allIds', payload.get('result')).set('isFetchedAllObjectives', true);
    },
    [ActionTypes.ADDED_OBJECTIVE]: (state, { payload }) => {
      const objectiveId = payload.get('result').first();
      state = addToAll(state, objectiveId);

      const userId = payload.get('currentUserId');
      const objective = payload.getIn(['entities', 'objectives', `${objectiveId}`]);
      const isMine = userId === objective.get('owner').get('id');
      return isMine ? add(state, objectiveId) : state;
    },
    [ActionTypes.UPDATED_OBJECTIVE]: (state, { payload }) => {
      const userId = payload.get('currentUserId');
      const objectiveId = payload.get('result').first();
      const objective = payload.getIn(['entities', 'objectives', `${objectiveId}`]);
      const isMine = userId === objective.get('owner').get('id');
      return isMine ? add(state, objectiveId) : remove(state, objectiveId);
    },
    [ActionTypes.REMOVED_OBJECTIVE]: (state, { payload }) => {
      const objectiveId = payload.get('result').first();
      state = removeFromAll(state, objectiveId);
      return remove(state, objectiveId);
    },
    [ActionTypes.UPDATED_USER]: (state, { payload }) => {
      let objectiveOrder = payload.user.get('objectiveOrder');
      if (!objectiveOrder) return state;
      objectiveOrder = JSON.parse(objectiveOrder);
      return state.update('ids', ids => ids.sortBy(id => objectiveOrder.indexOf(id)));
    },
  },
  fromJS({
    ids: [],
    allIds: [],
    fetchedObjective: null,
    isFetchedObjectives: false,
    isFetchedAllObjectives: false,
  }),
);
