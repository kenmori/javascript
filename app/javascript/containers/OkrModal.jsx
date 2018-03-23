import OkrModal from '../components/okrmodal/OkrModal';
import { connect } from 'react-redux';
import objectiveActions from '../actions/objectives';
import keyResultActions from '../actions/keyResults';
import dialogActions from '../actions/dialogs';
import { denormalizeObjective, denormalizeKeyResults } from '../schemas/index'

const mapStateToProps = (state) => {
  this.currentUserId = state.current.get('userId');
  const okrForm = state.dialogs.get('okrForm');
  const keyResultId = okrForm.get('keyResultId');
  const objectiveId = keyResultId
    ? state.entities.keyResults.getIn([keyResultId, 'objectiveId'], null)
    : okrForm.get('objectiveId');
  const hasObjectiveId = objectiveId && !state.entities.objectives.has(objectiveId);
  const hasKeyResultId = keyResultId && !state.entities.keyResults.has(keyResultId);
  const objective = objectiveId && denormalizeObjective(objectiveId, state.entities);
  const loginUserId = state.loginUser.get('id');
  const isAdmin = state.loginUser.get('isAdmin');
  return {
    isOpen: okrForm.get('isOpen'),
    objectiveId,
    objective,
    keyResultId,
    users: state.users.filter(user => !user.get('disabled')),
    loginUserId,
    keyResults: denormalizeKeyResults(state.keyResults.get(isAdmin ? 'allIds' : 'ids'), state.entities),
    isFetchedKeyResults: state.keyResults.get(isAdmin ? 'isFetchedAllKeyResults' : 'isFetchedKeyResults'),
    shouldFetchObjective: hasObjectiveId && !okrForm.get('isFetching'),
    shouldFetchKeyResult: hasKeyResultId && !okrForm.get('isFetching'),
    notFoundObjective: hasObjectiveId && okrForm.get('isFetched'),
    notFoundKeyResult: hasKeyResultId && okrForm.get('isFetched'),
    removedObjectiveId: okrForm.get('removedObjectiveId'),
    removedKeyResultId: okrForm.get('removedKeyResultId'),
    isOpenErrorModal: state.dialogs.getIn(['error', 'isOpen']),
    isObjectiveOwner: isAdmin || (objective && objective.get('owner').get('id') === loginUserId),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openObjectiveModal: parentKeyResult => {
      dispatch(dialogActions.openObjectiveModal(parentKeyResult));
    },
    openKeyResultModal: (objective) => {
      dispatch(dialogActions.openKeyResultModal(objective));
    },
    updateObjective: (objective, oldParentObjectiveId = null, oldParentKeyResultId = null) => {
      const args = { currentUserId: this.currentUserId, oldParentObjectiveId, oldParentKeyResultId };
      dispatch(objectiveActions.updateObjective(objective, args));
    },
    updateKeyResult: (keyResult) => {
      dispatch(keyResultActions.updateKeyResult(keyResult, this.currentUserId));
    },
    closeModal: () => {
      dispatch(dialogActions.closeOkrModal());
    },
    removeKeyResult: (id) => {
      dispatch(keyResultActions.removeKeyResult(id));
    },
    removeObjective: (id) => {
      dispatch(objectiveActions.removeObjective(id));
    },
    error: params => {
      dispatch(dialogActions.openErrorModal(params))
    },
    confirm: params => {
      dispatch(dialogActions.openConfirmModal(params));
    },
    fetchObjective: (objectiveId) => {
      dispatch(objectiveActions.fetchObjective(objectiveId));
    },
    fetchKeyResult: (keyResultId) => {
      dispatch(keyResultActions.fetchKeyResult(keyResultId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OkrModal);
