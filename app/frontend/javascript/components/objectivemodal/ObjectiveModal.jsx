import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { reduxForm } from 'redux-form'
import { Button, Modal, Tab } from 'semantic-ui-react'
import ObjectiveSidebar from './ObjectiveSidebar'
import ObjectiveForm from './ObjectiveForm'

class ObjectiveModal extends PureComponent {

  static INDEX_NEW = 0
  static INDEX_LINK = 1
  static INDEX_COPY = 2

  constructor() {
    super()
    this.state = {
      ownerId: null,
      description: '',
      activeIndex: ObjectiveModal.INDEX_NEW,
    }
    this.panes = [
      { menuItem: '新規作成', render: () => this.getObjectiveFormHtml({}) },
      { menuItem: '孤立 OKR 紐付け', render: () => this.getObjectiveFormHtml({ isLink: true }) },
      { menuItem: '前期 OKR コピー', render: () => this.getObjectiveFormHtml({ isCopy: true }) },
    ]
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      this.setState({
        ownerId: this.getInitialOwnerId(nextProps),
        description: '',
        activeIndex: ObjectiveModal.INDEX_NEW,
      })
      this.props.initialize({
        name: '',
        parentKeyResultId: nextProps.parentKeyResult ? nextProps.parentKeyResult.get('id') : -1,
        objectiveId: null,
      })
    }
  }

  save(validData) {
    const parentKeyResultId = validData.parentKeyResultId !== -1 ? validData.parentKeyResultId : null
    switch (this.state.activeIndex) {
      case ObjectiveModal.INDEX_NEW:
        this.props.addObjective({
          name: validData.name,
          description: this.state.description,
          ownerId: this.state.ownerId,
          parentKeyResultId,
          okrPeriodId: this.props.okrPeriodId,
        })
        break
      case ObjectiveModal.INDEX_LINK:
        this.props.updateObjective({
          id: validData.objectiveId,
          name: validData.name,
          description: this.state.description,
          objectiveMember: { user: this.state.ownerId },
          parentKeyResultId,
        })
        break
      case ObjectiveModal.INDEX_COPY:
        this.props.addObjective({
          id: validData.objectiveId,
          name: validData.name,
          description: this.state.description,
          ownerId: this.state.ownerId,
          parentKeyResultId,
          okrPeriodId: this.props.okrPeriodId,
        }, true)
        break
    }
  }

  getInitialOwnerId(props = this.props) {
    if (props.parentKeyResult) {
      const isMember = props.parentKeyResult.get('members').some(member => member.get('id') === props.loginUserId)
      return isMember ? props.loginUserId : props.parentKeyResult.getIn(['owner', 'id'])
    }
    return props.currentUserId
  }

  isEditing() {
    return this.props.dirty
      || this.state.ownerId !== this.getInitialOwnerId()
      || this.state.description !== ''
  }

  handleClose = () => {
    if(this.isEditing()) {
      this.props.confirm({
        content: '編集中の内容を破棄します。よろしいですか？',
        onConfirm: () => this.closeModal(),
      })
    } else {
      this.closeModal()
    }
  }

  closeModal() {
    // FIXME: キャンセルボタンで背面の OKR 編集モーダルごと閉じてしまう現象を setTimeout で回避する
    // 背面の OKR 編集モーダルのモーダル外クリックが発生している (おそらく Semantic-UI のバグ)
    setTimeout(() => this.props.closeModal(), 0)
  }

  handleFormChange = values => this.setState({ ...values })

  handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })

  getObjectiveFormHtml = ({ isLink = false, isCopy = false }) => {
    return (
      <Tab.Pane>
        <ObjectiveForm
          isLink={isLink}
          isCopy={isCopy}
          parentKeyResults={this.props.parentKeyResults}
          users={this.props.users}
          ownerId={this.state.ownerId}
          hasParentKeyResult={!!this.props.parentKeyResult}
          isFetchedKeyResults={this.props.isFetchedKeyResults}
          onChange={this.handleFormChange}
          fieldChange={this.props.change}
          description={this.state.description}
          objectives={isLink ? this.props.isolatedObjectives : (isCopy ? this.props.previousObjectives : undefined)}
          isFetchedObjectives={isLink ? this.props.isFetchedObjectives : (isCopy ? this.props.isFetchedPreviousObjectives : undefined)}
        />
      </Tab.Pane>
    )
  }

  render() {
    const { parentKeyResult, isOpen, handleSubmit } = this.props
    const hasParentKeyResult = !!parentKeyResult
    let modalSize = 'small'
    let wrapperClassName = 'objective-modal'
    if (hasParentKeyResult) {
      modalSize = 'large'
      wrapperClassName += ' is-keyresult'
    }
    return (
      <Modal
        closeIcon 
        open={isOpen}
        size={modalSize} 
        className={wrapperClassName}
        onClose={this.handleClose}
      >
        <Modal.Header>
          Objective を入力する
        </Modal.Header>
        <Modal.Content>
          <div className="objective-modal__body">
            <ObjectiveSidebar parentKeyResult={parentKeyResult} />
            <div className="objective-modal__main">
              <Tab panes={this.panes} onTabChange={this.handleTabChange} />
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleClose}>キャンセル</Button>
          <Button positive onClick={handleSubmit(data => this.save(data))}>保存</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

ObjectiveModal.propTypes = {
  // container
  isOpen: PropTypes.bool.isRequired,
  parentKeyResult: ImmutablePropTypes.map,
  currentUserId: PropTypes.number.isRequired,
  users: ImmutablePropTypes.list.isRequired,
  okrPeriodId: PropTypes.number.isRequired,
  parentKeyResults: ImmutablePropTypes.list.isRequired,
  isFetchedKeyResults: PropTypes.bool.isRequired,
  isolatedObjectives: ImmutablePropTypes.list.isRequired,
  isFetchedObjectives: PropTypes.bool.isRequired,
  previousObjectives: ImmutablePropTypes.list.isRequired,
  isFetchedPreviousObjectives: PropTypes.bool.isRequired,
  addObjective: PropTypes.func.isRequired,
  updateObjective: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  // component
  // Redux Form
  dirty: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
}

export default reduxForm({
  form: 'objectiveModal',
})(ObjectiveModal)