import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

class UpdateTitle extends Component {
  constructor(props) {
    super(props);
    let contentBlock = htmlToDraft('');
    if (this.props.layer.attributes.description) {
      contentBlock = htmlToDraft(this.props.layer.attributes.description);
    }
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
    const editorState = EditorState.createWithContent(contentState)
    this.state = {
      editing: false,
      editorState,
      layerTitle: this.props.layer.attributes.title,
      layerDescription: this.props.layer.attributes.description
    };

    this.updateLayerTitle = this.updateLayerTitle.bind(this);
    this.updateLayerDescription = this.updateLayerDescription.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveLayer = this.saveLayer.bind(this);
  }

  toggleEdit() {
    this.setState({editing: !this.state.editing});
  }

  updateLayerTitle(event) {
    this.props.layer.attributes.title = event.target.value;
  }

  updateLayerDescription(editorState) {
    this.props.layer.attributes.description = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    this.setState({ editorState });
  }

  async saveLayer(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.props.layer));
    try {
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
      const { editorState } = this.state;
      return(
        <form class="uk-form-stacked" onSubmit={this.saveLayer}>
          <div class="uk-margin">
            <label class="uk-form-label" for={`title-for-${this.props.layer.id}`}>Title</label>
            <div class="uk-form-controls">
              <input
                className="uk-input"
                type="text"
                defaultValue={this.props.layer.attributes.title}
                onChange={this.updateLayerTitle}
              />
            </div>
          </div>
          <div class="uk-margin">
            <label class="uk-form-label" for={`description-for-${this.props.layer.id}`}>Description</label>
            <Editor
              editorState={editorState}
              onEditorStateChange={this.updateLayerDescription}
              editorClassName="editor"
            />
          </div>
          <input
            className="uk-button uk-button-large uk-button-primary"
            type="submit"
            value="save"
          />
          <button
            className="uk-button uk-button-large uk-button-default"
            type="button"
            onClick={this.toggleEdit}
          >
            cancel
          </button>
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