import React, { Component } from 'react';
import { Menu, Button, Segment, Header, Label } from 'semantic-ui-react';
import ObjectiveList from '../../containers/ObjectiveList';
import KeyResultList from '../../containers/KeyResultList';
import OkrMap from '../../containers/OkrMap';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapObjective: null,
      mapObjectiveId: null,
      activeItem: 'objective',
    };
  }

  componentDidMount() {
    this.props.fetchOkrs(this.props.okrPeriodId, this.props.userId, this.props.isAdmin);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.okrPeriodId !== nextProps.okrPeriodId) {
      this.props.fetchOkrs(nextProps.okrPeriodId, nextProps.userId, this.props.isAdmin);
    } else if (this.props.userId !== nextProps.userId) {
      this.props.fetchOkrs(nextProps.okrPeriodId, nextProps.userId, false);
    } else if (this.props.fetchedObjectiveId !== nextProps.fetchedObjectiveId) {
      const objective = this.getCurrentMapObjective(nextProps.objectives, nextProps.keyResults, nextProps.fetchedObjective);
      if (objective) {
        this.setMapObjective(objective);
      }
    } else if (this.props.selectedObjectiveId !== nextProps.selectedObjectiveId) {
      const objective = nextProps.objectives.find(objective => objective.get('id') === nextProps.selectedObjectiveId);
      this.setMapObjective(objective);
    } else if (this.props.entities !== nextProps.entities) {
      const objective = this.getCurrentMapObjective(nextProps.objectives, nextProps.keyResults);
      if (objective) {
        this.setMapObjective(objective);
      }
    }
  }

  getCurrentMapObjective = (nextObjectives, nextKeyResults, nextFetchedObjective = null) => {
    // 現在選択中の Objective を nextProps の中から探して返す
    const prevObjectiveId = this.state.mapObjectiveId;
    if (nextFetchedObjective && nextFetchedObjective.get('id') === prevObjectiveId) {
      return nextFetchedObjective; // 選択 Objective を fetch した場合
    }
    let prevObjective = nextObjectives.find(objective => objective.get('id') === prevObjectiveId);
    if (!prevObjective) {
      const prevKeyResult = nextKeyResults.find(keyResult => keyResult.get('objectiveId') === prevObjectiveId);
      if (prevKeyResult) {
        prevObjective = prevKeyResult.get('objective');
      }
    }
    return prevObjective;
  }

  setMapObjective = objective => {
    this.setState({
      mapObjective: objective,
      mapObjectiveId: objective && objective.get('id'),
    });
  }

  setMapObjectiveId = objectiveId => {
    this.setState({
      mapObjectiveId: objectiveId,
    });
  }

  handleMenuItemClick = (e, { name }) => {
    this.setState({
      activeItem: name,
    });
  }

  emptyViewHtml() {
    return (
      <Segment compact padded='very' textAlign='center' className='empty-view'>
        <Header as='h4'>Objective がありません</Header>
        <Button icon="plus" content='OKR を作成する' onClick={this.props.openObjectiveModal} />
      </Segment>
    );
  }

  render() {
    let activeItem = this.state.activeItem;
    if (this.props.objectives.size > 0 && this.props.keyResults.size === 0) {
      activeItem = 'objective';
    } else if (this.props.objectives.size === 0 && this.props.keyResults.size > 0 && this.props.isFetchedObjectives) {
      activeItem = 'keyResult';
    }
    return (
      <div className="dashboard">
        <section className="okr-list-section">
          <div className='okr-list-section__menu'>
            <Menu tabular>
              <Menu.Item name='objective' active={activeItem === 'objective'} onClick={this.handleMenuItemClick}>
                Objective<Label>{this.props.objectives.size}</Label>
              </Menu.Item>
              <Menu.Item name='keyResult' active={activeItem === 'keyResult'} onClick={this.handleMenuItemClick}>
                Key Result<Label>{this.props.keyResults.size}</Label>
              </Menu.Item>
              <Menu.Item>
                <Button compact icon="plus" content='OKR を作成する' onClick={this.props.openObjectiveModal} />
              </Menu.Item>
            </Menu>
          </div>
          {activeItem === 'objective'
            ? <ObjectiveList objectives={this.props.objectives}
                             setMapObjective={this.setMapObjective}
                             userId={this.props.userId}
                             objectiveOrder={this.props.objectives.map(objective => objective.get('id'))}
                             updateObjectiveOrder={this.props.updateObjectiveOrder}
                             canMoveObjective={this.props.canMoveObjective} />
            : <KeyResultList keyResults={this.props.keyResults}
                             setMapObjective={this.setMapObjective}
                             setMapObjectiveId={this.setMapObjectiveId} />
          }
        </section>
        <section className='okr-map-section'>
          <div className='okr-map-section__menu'>
            <Menu tabular compact>
              <Menu.Item header>OKR マップ</Menu.Item>
            </Menu>
          </div>
          {this.state.mapObjective
            ? <OkrMap objective={this.state.mapObjective} />
            : this.props.isFetchedObjectives && this.emptyViewHtml()
          }
        </section>
      </div>
    );
  }
}
