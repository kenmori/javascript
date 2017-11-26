import React, { Component } from 'react';
import ObjectiveMap from './ObjectiveMap';
import ObjectivePieChart from './ObjectivePieChart';
import Avatar from './Avatar';

export default class Dashboard extends Component {
  selectOKRBox = (objective) => {
    return () => {
      this.setState({
        selectedObjective: objective
      });
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedObjective: null,
    };
  }

  componentDidMount() {
    this.props.fetchObjectives(this.props.menu.get('okrPeriodId'), this.props.menu.get('userId'));
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.objectives && this.props.objectives !== nextProps.objectives) {
      //Objective一覧を取得、Objective追加時には最新のObjectiveをセットする
      this.setState({
        selectedObjective: nextProps.objectives.first()
      });
    }
    if(nextProps.menu && this.props.menu !== nextProps.menu) {
      this.props.fetchObjectives(nextProps.menu.get('okrPeriodId'), nextProps.menu.get('userId'));
    }
  }

  get actionSection() {
    if (this.state.selectedObjective) {
      return <ObjectiveMap objective={this.state.selectedObjective}/>;
    }
  }

  render() {
    if (!this.props.user) {
      return null;
    }
    return (
      <div className="dash-board">
        <section className="login-user">
          <Avatar user={this.props.user} />
          <div className="info flex-vertical-center">
            <div>{this.props.user.get('lastName') + this.props.user.get('firstName')}</div>
            <div>{this.props.user.get('email')}</div>
          </div>
        </section>
        <section className="okr">
          Objective 一覧 ({this.props.objectives.size})
          <div className="okr-list">
            {
              this.props.objectives.map((objective) => {
                const isSelected = objective.get('id') === (this.state.selectedObjective && this.state.selectedObjective.get('id'));
                return (
                  <a className={`okr-box ${isSelected ? 'active' : ''}`} key={objective.get('id')}
                     href="javascript:void(0)" onClick={this.selectOKRBox(objective)}>
                    <div>{objective.get('name')}</div>
                    <ObjectivePieChart objective={objective}/>
                  </a>
                );
              }) }
            <a className={`okr-box ${this.state.selectedObjective ? '' : 'active'}`} href="javascript:void(0)"
               onClick={() => this.props.openObjectiveFormModal()}>
              Objective を作成する
            </a>
          </div>
        </section>
        <section className='okr-action-section'>
          {this.actionSection}
        </section>
      </div>
    );
  }
}
