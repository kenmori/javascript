import KeyResultFormModal from '../components/KeyResultFormModal';
import { connect } from 'react-redux';
import actions from '../actions/keyResults';
import dialogActions from '../actions/dialogs';

const mapStateToProps = (state) => {
  return {
    isOpen: state.dialogs.getIn(['keyResultForm', 'isOpen']),
    objective: state.dialogs.getIn(['keyResultForm', 'objective']),
    users: state.users,
    menu: state.menu,
    okrPeriods: state.okrPeriods,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addKeyResult: (keyResult) => {
      dispatch(actions.addKeyResult(keyResult));
    },
    closeModal: () => {
      dispatch(dialogActions.closeKeyResultFormModal());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyResultFormModal);