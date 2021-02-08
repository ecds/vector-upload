import React, { Component } from 'react';
const UIkit = require('uikit');

class Sort extends Component {
  constructor(props) {
    super(props);
    this.sortableRef = React.createRef();
  }

  componentDidMount() {
    this.mounted = true;
    if (this.sortableRef.current) {
      // const { options } = this.props;
      const options = {
        group: this.props.group
      }
      this.component = UIkit.sortable(this.sortableRef.current, options);
      UIkit.grid(this.sortableRef.current, options);

      if (this.mounted) {
        UIkit.util.on(
          this.sortableRef.current,
          'start stop moved added removed',
          event => {
            const eventName = event.type;
            if (eventName == 'added' && this.props.onAdded) {
              this.props.onAdded(event, this.props)
            }
            if (eventName == 'removed' && this.props.onRemoved) {
              this.props.onRemoved(event, this.props)
            }
            if (eventName == 'moved' && this.props.onMoved) {
              this.props.onRemoved(event, this.props)
            }
          }
        )
      }
    }
  }

  render() {
    return(
      <div
        ref={this.sortableRef}
        id={this.props.id ? this.props.id : null}
        style={this.props.style ? this.props.style : null}
        className="uk-flex-center uk-child-width-auto uk-padding-small uk-text-small"
      >
        {this.props.children}
      </div>
    )
  }
}

export default Sort;