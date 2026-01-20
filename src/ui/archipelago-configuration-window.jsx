import _ from 'lodash';
import React from 'react';

import KeyDownWrapper from './key-down-wrapper';

class ArchipelagoConfigurationWindow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      connectionUri: "",
      slotName: "",
      password: ""
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  };

  handleConnect = () => {
    const { connectionUri, slotName, password } = this.state;
    const { connectToArchipelago, archipelagoConnected, disconnectArchipelago } = this.props;
    if (archipelagoConnected) {
      disconnectArchipelago();
    } else {
      if (connectionUri.length > 0 && slotName.length > 0 ) {
        connectToArchipelago(connectionUri, slotName, password);
      }
    }
  };

  render() {
    const {
      toggleArchipelagoInfo,
      archipelagoConnected
    } = this.props;

    const btnText = archipelagoConnected ? "Disconnect" : "Connect";

    const { connectionUri, slotName, password, con_error } = this.state;

    return (
      <div className="settings-window">
        <div className="settings-window-top-row">
          <div className="settings-window-title">Archipelago Configuration</div>
          <div
            className="close-button"
            onClick={toggleArchipelagoInfo}
            onKeyDown={KeyDownWrapper.onSpaceKey(toggleArchipelagoInfo)}
            role="button"
            tabIndex="0"
          >
            X Close
          </div>
        </div>
        <div className="settings-window-row">
          <label
            className="settings-window-label"
            htmlFor="archipelago-connection"
          >
            Connection URI
          </label>
          <input 
            id="archipelago-connection"
            placeholder="archipelago.gg:<port>"
            name="connectionUri"
            value={connectionUri}
            onChange={this.handleChange}
          ></input>
        </div>
        <div className="settings-window-row">
          <label
            className="settings-window-label"
            htmlFor="archipelago-slot-name"
          >
            Slot Name
          </label>
          <input 
            id="archipelago-slot-name"
            type="text"
            name="slotName"
            value={slotName}
            onChange={this.handleChange}
          ></input>
        </div>
        <div className="settings-window-row">
          <label
            className="settings-window-label"
            htmlFor="archipelago-password"
          >
            Password
          </label>
          <input 
            id="archipelago-password"
            type="password"
            name="password"
            placeholder="Optional"
            value={password}
            onChange={this.handleChange}
          ></input>
        </div>
        <div className="settings-window-row">
          <button id="archieplago-connect-btn" onClick={this.handleConnect}>{btnText}</button>
          <label className="settings-window-label" htmlFor="archipelago-connect-btn">Logging In JS Console</label>
        </div>

      </div>
    );
  }
}

export default ArchipelagoConfigurationWindow;
