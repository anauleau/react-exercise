import React, { Component } from 'react'
import './App.css'

let _messagesList = [
   {title: 'first', labels: {}, selected: false, id: 1, timestamp: '2pm 1/1/18'},
   {title: 'second', labels: {}, selected: false, id: 2, timestamp: '3pm 1/5/18'},
   {title: 'third', labels: {}, selected: false, id: 3, timestamp: '9pm 3/5/18'},
   {title: 'fourth', labels: {}, selected: false, id: 4, timestamp: '9pm 3/5/18'}
]

let _labels = [
   {name: 'foo', messages: {}, id: 11, indeterminate: false, value: false},
   {name: 'bar', messages: {}, id: 22, indeterminate: false, value: false},
   {name: 'baz', messages: {}, id: 32, indeterminate: false, value: false}
]

function getLabelsMap (labels) {
  var labelsMap = {}
  labels.forEach(label => {
    labelsMap[label.id] = label.name
  })
  return labelsMap
}

function getLabelsFromMessages (selectedMessageIndexes, messages) {
  let result = {}
  selectedMessageIndexes.forEach(index => {
    Object.keys(messages[index].labels).forEach(labelID => {
      result[labelID] = true
    })
  })
  return result
}

let _labelsMap = getLabelsMap(_labels)

class App extends Component {
  constructor (props) {
    super(props)
    this.handleLabelCheckboxChange = this.handleLabelCheckboxChange.bind(this)
    this.applyLabelChangesToMessages = this.applyLabelChangesToMessages.bind(this)
    this.handleMessageCheckboxChange = this.handleMessageCheckboxChange.bind(this)
    this.state = {
      labels: _labels,
      messages: _messagesList,
      selectedMessagesByIndex: [],
      alteredLabelsByID: []
    }
  }
  handleLabelCheckboxChange (label) {
    let newState = Object.assign({}, this.state)
    let {labels, alteredLabelsByID, selectedMessagesByIndex, messages} = newState
    const labelIndex = labels.indexOf(label)
    const allSelectedMessageLabelsMap = getLabelsFromMessages(selectedMessagesByIndex, messages)
    if (selectedMessagesByIndex.length === 0 || !allSelectedMessageLabelsMap[label.id]) {
      labels[labelIndex].value = !labels[labelIndex].value
    } else {
      if (!labels[labelIndex].value && !labels[labelIndex].indeterminate) {
        labels[labelIndex].indeterminate = true
      } else if (labels[labelIndex].indeterminate) {
        labels[labelIndex].indeterminate = false
        labels[labelIndex].value = true
      } else {
        labels[labelIndex].value = false
      }
    }
    if (alteredLabelsByID.indexOf(label.id) === -1) alteredLabelsByID.push(label.id)
    else if (labels[labelIndex].indeterminate && allSelectedMessageLabelsMap[label.id]) alteredLabelsByID = alteredLabelsByID.filter(value => value !== label.id)
    this.setState({
      labels: labels,
      alteredLabelsByID: alteredLabelsByID
    })
  }
  handleMessageCheckboxChange (index) {
    let newState = Object.assign({}, this.state)
    let {messages, selectedMessagesByIndex, labels} = newState
    messages[index].selected = !messages[index].selected

    if (selectedMessagesByIndex.indexOf(index) === -1) selectedMessagesByIndex.push(index)
    else selectedMessagesByIndex = selectedMessagesByIndex.filter(value => value !== index)

    let selectedMessages = selectedMessagesByIndex.map(index => (messages[index]))
    let selectedMessagesLabelCountObject = {}
    selectedMessages.forEach(message => {
      Object.keys(message.labels).forEach((id) => {
        if (!selectedMessagesLabelCountObject[id]) selectedMessagesLabelCountObject[id] = 1
        else selectedMessagesLabelCountObject[id] += 1
      })
    })
    labels.forEach(label => {
      if (selectedMessagesLabelCountObject[label.id] === selectedMessagesByIndex.length) {
        label.value = true
        label.indeterminate = false
      } else if (selectedMessagesLabelCountObject[label.id]) {
        label.indeterminate = true
      }
    })
    this.setState({
      messages: messages,
      selectedMessagesByIndex: selectedMessagesByIndex,
      labels: labels
    })
  }
  applyLabelChangesToMessages () {
    let newState = Object.assign({}, this.state)
    let {messages, labels, selectedMessagesByIndex, alteredLabelsByID} = newState
    selectedMessagesByIndex.forEach(messageIndex => {
      let message = messages[messageIndex]
      alteredLabelsByID.forEach(labelID => {
        let label = labels.filter(label => label.id === labelID)[0]
        if (label.value) {
          message.labels[label.id] = label.value
          label.messages[message.id] = message
        } else {
          delete label.messages[message.id]
          delete message.labels[label.id]
        }
      })
    })
    labels.map(label => {
      label.indeterminate = false
      label.value = false
    })
    messages.map(message => {
      message.selected = false
    })
    this.setState({
      labels: labels,
      messages: messages,
      selectedMessagesByIndex: [],
      alteredLabelsByID: [],
      messageSelectedFirst: null,
      labelSelectedFirst: null
    })
  }
  render () {
    return (
      <div className='app-container'>
        <div className='label-list-frame'>
          <LabelList labels={this.state.labels}
            applyLabelChangesToMessages={this.applyLabelChangesToMessages}
            handleLabelCheckboxChange={this.handleLabelCheckboxChange} />
        </div>
        <div>
          <MessageList messages={this.state.messages} handleMessageCheckboxChange={this.handleMessageCheckboxChange} />
        </div>
      </div>
    )
  }
}

class Label extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
  }
  componentDidUpdate () {
    this.ref.current.indeterminate = this.props.label.indeterminate
  }
  render () {
    return (
      <li className='label-list-item'>
        <input type='checkbox'
          ref={this.ref}
          checked={this.props.label.value}
          onChange={e => { this.props.clickHandler(this.props.label) }} />
        <label>{this.props.label.name}</label>
      </li>
    )
  }
}

class LabelList extends Component {
  constructor (props) {
    super(props)
    this.handleButtonSubmit = this.handleButtonSubmit.bind(this)
    this.onCheckBoxChange = this.onCheckBoxChange.bind(this)
  }
  handleButtonSubmit () {
    this.props.applyLabelChangesToMessages()
  }
  onCheckBoxChange (label) {
    this.props.handleLabelCheckboxChange(label)
  }
  render () {
    let labels = this.props.labels.map((label, index) => {
      return (<Label key={label.id} label={label} clickHandler={this.onCheckBoxChange} />)
    })
    return (
      <div className='label-list-container'>
        <h1>Labels</h1>
        <ul className='label-list'>{labels}</ul>
        <button className='label-list-button' onClick={this.handleButtonSubmit} >Apply</button>
      </div>
    )
  }
}

class MessageList extends Component {
  render () {
    let messages = this.props.messages.map((message, index) => {
      return (
        <li key={index} className={'message-list-item ' + (index + 1 === this.props.messages.length ? 'last-message' : '')}>
          <input type='checkbox' checked={message.selected} onChange={(e) => {
            this.props.handleMessageCheckboxChange(index)
          }} />
          <label className='message-title'>{message.title}</label>
          <LabelTags messageLabels={message.labels} />
          <span className='message-list-timestamp'>{message.timestamp}</span>
        </li>
      )
    })
    return (<ul className='message-list'>{messages}</ul>)
  }
}
// These labels are listed next to the messages
class LabelTags extends Component {
  render () {
    let labels = []
    for (var labelID in this.props.messageLabels) {
      if (this.props.messageLabels.hasOwnProperty(labelID)) {
        labels.push((<span key={labelID} className='label-tag'>{_labelsMap[labelID]}</span>))
      }
    }
    return (
      <span>{labels}</span>
    )
  }
}

export default App
