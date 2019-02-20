import { connect } from "react-redux";
import OkrPeriodSettingTab from "../../../components/organisms/OkrPeriodSettingTab";
import okrPeriodActions from "../../../actions/okrPeriods";
import dialogActions from "../../../actions/dialogs";

const mapStateToProps = state => {
  const organization = state.organization.get("current");
  return {
    okrPeriods: state.okrPeriods,
    okrPeriodId: state.current.get("okrPeriodId"),
    organizationId: organization.get("id"),
    okrSpan: organization.get("okrSpan"),
  };
};

const mapDispatchToProps = dispatch => ({
  addOkrPeriod: okrPeriod => {
    dispatch(okrPeriodActions.addOkrPeriod(okrPeriod));
  },
  updateOkrPeriod: okrPeriod => {
    dispatch(okrPeriodActions.updateOkrPeriod(okrPeriod));
  },
  removeOkrPeriod: okrPeriod => {
    dispatch(okrPeriodActions.removeOkrPeriod(okrPeriod));
  },
  confirm: params => {
    dispatch(dialogActions.openConfirmModal(params));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OkrPeriodSettingTab);
