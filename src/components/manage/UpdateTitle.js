import React, { Component } from 'react';

class UpdateTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      layerTitle: this.props.layer.attributes.title
    };

    this.updateLayer = this.updateLayer.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveLayer = this.saveLayer.bind(this);
  }

  toggleEdit() {
    this.setState({editing: true});
  }

  updateLayer(event) {
    this.props.layer.attributes.title = event.target.value;
  }

  async saveLayer(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.props.layer))
    try {
    console.log("🚀 ~ file: UpdateTitle.js ~ line 29 ~ UpdateTitle ~ saveLayer ~ formData", formData)
      let response = await fetch (
        `${process.env.REACT_APP_API_HOST}/vector-layers/${this.props.layer.id}`,
        {
          method: 'PATCH',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json'
          },
          body: JSON.stringify({data: this.props.layer})
        }
      );
      if (response.ok) {
        this.setState({
          editing: false
        });
      } else {
        // let error= await response.json();
        // this.setState({
        //   error: error.message
        // });
      }
    } catch(error) {
      console.log(error);
    } finally {
      this.setState({
        uploadProgress: {},
        uploading: false
      });
    }
  }

  render() {
    if (this.state.editing) {
      return(
        <form onSubmit={this.saveLayer}>
          <input
            className="uk-input"
            type="text"
            defaultValue={this.props.layer.attributes.title}
            onChange={this.updateLayer}
          />
          <input
            className="uk-button uk-button-large uk-button-primary"
            type="submit"
            value="save"
          />
        </form>
      )
    } else {
      return(
        <button type="button" className="uk-button uk-button-link" onClick={this.toggleEdit}>
          {this.props.layer.attributes.title}
        </button>
      )
    }
  }
}

export default UpdateTitle;