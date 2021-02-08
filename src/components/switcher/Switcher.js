import React, { Component } from 'react';
const UIkit = require('uikit');

class Switcher extends Component {
  constructor(props) {
    super(props);
    this.switcherRef = React.createRef();
  }

  componentDidMount() {
    if (this.switcherRef.current) {
      this.component = UIkit.switcher(this.switcherRef.current, {});

      // UIkit.util.on(
      //   this.switcherRef.current,
      //   'beforeshow show shown beforehide hide hidden',
      //   event => {
      //     const eventName = event.type;
      //     if (eventName == 'shown' && this.props.onAdded) {
      //       this.props.onShown(event, this.props)
      //     }
      //   }
      // )
    }
  }

  render() {
    return(
      <ul className="uk-subnav uk-subnav-pill" ref={this.switcherRef}>
        {this.props.children}
      </ul>
    )
  }

}

export default Switcher