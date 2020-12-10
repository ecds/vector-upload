import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Dropzone from '../dropzone/Dropzone';
import Progress from '../progress/Progress';
import Preview from '../preview/Preview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'uikit-react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './Upload.css';

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      layerTitle: '',
      layerDescription: '',
      editorState: EditorState.createEmpty(),
      uploading: false,
      uploadProgress: {},
      successfulUploaded: false,
      standardAttributes: ['title', 'description', 'images', 'video', 'break', 'longitude', 'latitude'],
      mappedAttributes: {
        title: null,
        images: null,
        video: null,
        description: null
      },
      incomingAttributes: null,
      geojson: null,
      error: null,
      success: null
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.fetchFromUrl = this.fetchFromUrl.bind(this);
    this.uploadFileToParse = this.uploadFileToParse.bind(this);
    this.sendMappedAttributes = this.sendMappedAttributes.bind(this);
    this.uploadFinal = this.uploadFinal.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.onAttributeSelected = this.onAttributeSelected.bind(this);
    this.clearAlert = this.clearAlert.bind(this);
    this.updateLayerTitle = this.updateLayerTitle.bind(this);
    this.updateDescription = this.updateDescription.bind(this);

    this.attributeSelectRef = React.createRef();
  }

  async onFilesAdded(file) {
    await this.setState({
      uploading: true,
      file
    });
    this.uploadFileToParse();
  }

  async fetchFromUrl(url) {
    await this.setState(prevState => ({
      uploading: true,
      url
    }));

    try {
      let response = await fetch(
        url,
        {
          method: 'GET'
        }
      );
      if (response.ok) {
        let data = await response.json();
        console.log("Upload -> fetchFromUrl -> data", data)
        const file = new Blob([JSON.stringify(data)]);
        this.setState({ file });
        await this.uploadFileToParse();
      }
    } catch(error) {
      console.log(error);
    }
  }

  // TODO: Does this need to be async?
  async uploadFileToParse() {
    this.setState({ uploadProgress: {}, uploading: true });
    const formData = new FormData();
    formData.append('fileToParse', this.state.file);

    try {
      let response = await fetch(
        `${process.env.REACT_APP_API_HOST}/uploads/vector/parse`,
        {
          method: 'POST',
          body: formData,
          mode: 'cors',
          credentials: 'include'
        }
      );
      if (response.ok) {
        let data = await response.json();
        this.setState({
          incomingAttributes: data.attributes
        });
      } else {
        let error= await response.json();
        this.setState({
          error: error.message
        });
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

  async sendMappedAttributes() {
    this.clearAlert();
    this.setState({
      uploadProgress: {},
      uploading: true,
      geojson: null
    });
    const formData = new FormData();
    formData.append('file', this.state.file);
    formData.append('mappedAttributes', JSON.stringify(this.state.mappedAttributes));

    try {
      let response = await fetch(
        `${process.env.REACT_APP_API_HOST}/uploads/vector/preview`,
        {
          method: 'POST',
          body: formData
        }
      );
      if (response.ok) {
        let data = await response.json();
        this.setState({
          geojson: data
        });
      } else {
        let error = await response.json();
        this.setState({
          error: error.message
        });
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

  async uploadFinal() {
    console.log('uploading')
    this.setState({ uploading: true });
    const formData = new FormData();
    const tmp_file = new Blob([JSON.stringify(this.state.geojson)], { type: 'application/json'}, `${Date.now()}.json`);
    formData.append('file', tmp_file);
    formData.append('title', this.state.layerTitle);
    formData.append('description', this.state.layerDescription);
    formData.append('geojson', JSON.stringify(this.state.geojson));

    try {
      let response = await fetch (
        `${process.env.REACT_APP_API_HOST}/uploads/vector/new`,
        {
          method: 'POST',
          body: formData
        }
      );
      if (response.ok) {
        this.setState({
          geojson: null,
          mappedAttributes: {
            title: null,
            images: null,
            video: null,
            description: null
          },
          layerTitle: null,
          incomingAttributes: null,
          success: 'SUCCESS! The layer has been added. 🚀'
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

  onAttributeSelected(event) {
    let mappedAttributes = {...this.state.mappedAttributes};
    mappedAttributes[event.target.labels[0].innerHTML] = event.target.value;
    this.setState({ mappedAttributes });
  }

  clearAlert() {
    this.setState({
      error: null,
      success: null
    });
  }

  updateLayerTitle(event) {
    console.log("Upload -> updateLayerTitle -> event", event)
    this.setState({
      layerTitle: event.target.value
    });
  }

  updateDescription(editorState) {
    this.setState({
      layerDescription: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      editorState
    })
  }

  render() {
    return (
      <div className="Upload">
        {this.renderAlert()}
        {this.renderIncomingAttributes()}
        <div className="Content uk-child-width-1-1 uk-grid">
          {this.renderDropzone()}
          <div className="Files">
            <div>{this.renderOverlay()}</div>
          </div>
          <div className="Preview">
            {this.renderPreview()}
            <div className="uk-margin">
              {this.renderSaveButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderAlert() {
    if (this.state.error) {
      return (
        <div>
          <Alert content={this.state.error} isClosable color="danger" onHide={this.clearAlert} />
        </div>
      )
    } else if (this.state.success) {
      return (
        <div>
          <Alert content={this.state.success} color="success" onHide={this.clearAlert} duration={3000} />
        </div>
      )
    }
  }

  renderDropzone() {
    if (!this.state.incomingAttributes) {
      return (
        <Dropzone
          onFilesAdded={this.onFilesAdded}
          fetchFromUrl={this.fetchFromUrl}
          disabled={this.state.uploading || this.state.successfulUpload}
        />
      )
    }
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfulUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
        </div>
      );
    }
  }

  renderOverlay() {
    if (this.state.uploading) {
      return (
        <div className="uk-position-absolute uk-text-center Overlay">
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      )
    }
  }

  renderActions() {
    if (this.state.successfulUploaded) {
      return (
        <button
          onClick={() =>
            this.setState({ file: null, successfulUploaded: false })
          }
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFileToParse}
        >
          Upload
        </button>
      );
    }
  }

  renderIncomingAttributes() {
    if (this.state.incomingAttributes) {
      return (
        <form className="uk-form-stacked uk-text-large uk-text-capitalize">
          {this.state.standardAttributes.map((attr, index) => {
            return (
              <div className="uk-margin" key={`stdAttr-${index}`}>
                <label htmlFor={`attr-${index}`} className="uk-form-label uk-text-large">
                  {attr}
                </label>
                <div className="uk-form-controls">
                  <select
                    ref={this.attributeSelectRef}
                    id={`attr-${index}`}
                    name={attr}
                    className="uk-select"
                    onChange={this.onAttributeSelected}
                  >
                    <option value="">--Select Corresponding Attribute--</option>
                    {this.state.incomingAttributes.map((inAttr, index) => {
                      return (
                        <option value={inAttr} key={`inAttr-${index}`}>{inAttr}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
            )
          })}
          <div className="uk-margin">
            <div className="uk-form-control">
              <button
                className="uk-button uk-button-large uk-button-secondary"
                type="button"
                onClick={this.sendMappedAttributes}
              >
                Preview
              </button>
            </div>
          </div>
        </form>
      )
    } else {
      return (<span></span>)
    }
  }

  renderPreview() {
    const { editorState } = this.state;
    if (this.state.geojson) {
      return (
        <div>
          <div className="uk-margin">
            <label htmlFor='layer-name' className="uk-form-label uk-text-large">
              Layer Title
            </label>
            <div className="uk-form-controls">
              <input
                type="text"
                id="layer-name"
                className="uk-input"
                value={this.state.layerTitle}
                placeholder="Enter a name for the layer to save."
                onChange={this.updateLayerTitle}
              />
            </div>
          </div>
          <div className="uk-margin">
            <label className="uk-form-label uk-text-large">
              Layer Description
            </label>
            <div className="uk-form-controls">
              <Editor
                editorState={editorState}
                onEditorStateChange={this.updateDescription}
                editorClassName="editor"
              />
            </div>
          </div>
          <Preview data={this.state.geojson} mappedAttributes={this.state.mappedAttributes}/>
        </div>
      )
    }
  }

  renderSaveButton() {
    if (this.state.layerTitle) {
      return (
        <div className="uk-margin">
          <button
            className="uk-button uk-button-large uk-button-primary"
            type="button"
            onClick={this.uploadFinal}
          >
            Save
          </button>
        </div>
      )
    }
  }
}


export default Upload;