import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Dropzone from '../dropzone/Dropzone';
import Progress from '../progress/Progress';
import Preview from '../preview/Preview';
import SetColors from '../set-colors/SetColors';
import Sort from '../sort/Sort';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'uikit-react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './Upload.css';
import { map } from 'leaflet';
import chroma from 'chroma-js';

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
      standardAttributes: ['title', 'description', 'images', 'video', 'longitude', 'latitude', 'break'],
      mappedAttributes: {
        title: null,
        images: null,
        video: null,
        description: null,
        dataAttributes: [],
        colorMap: null,
        break: null
      },
      steps: 5,
      brew: 'Blues',
      incomingAttributes: null,
      geojson: null,
      featureData: null,
      isQuantitative: false,
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
    this.updateColor = this.updateColor.bind(this);
    this.addDataAttribute = this.addDataAttribute.bind(this);

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
          incomingAttributes: data.attributes,
          featureData: data.data
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
          layerTitle: '',
          layerDescription: '',
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
    this.setState({ error: null });
    let mappedAttributes = {...this.state.mappedAttributes};
    const attribute = event.target.labels[0].innerHTML;
    mappedAttributes[attribute] = event.target.value;

    if (attribute == 'break') {
      mappedAttributes.colorMap = null;
      mappedAttributes.break = event.target.value;
      mappedAttributes.colorMap = {};
      const values = this.state.featureData.map(p => p.properties[event.target.value]);

      if (values.every(n => isNaN(n))) {
        this.setState({ isQuantitative: false });
        [...new Set(values)].sort().map(value => {
          mappedAttributes.colorMap[value] = {
            color: chroma.random().hex()
          };
        });

        this.setState({ mappedAttributes });
      } else if (values.every(n => isFinite(n))) {
        this.setState({ isQuantitative: true });
        mappedAttributes.colorMap.brew = this.state.brew;
        mappedAttributes.colorMap.steps = this.state.steps;
      } else {
        mappedAttributes.colorMap = null;
        this.setState({ error: 'Values are either a mix of qualitative and quantitative and/or some are missing.'})
      }
    }

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
    });
  }

  updateColor(event) {
    console.log("🚀 ~ file: Upload.js ~ line 276 ~ Upload ~ updateColor ~ event", event.target)
    let mappedAttributes = {...this.state.mappedAttributes};
    if (event.target.type == 'radio') {
      mappedAttributes.colorMap.brew = event.target.value;
      this.setState({ brew: event.target.value });
    } else if (event.target.id == 'steps') {
      mappedAttributes.colorMap.steps = event.target.value;
      this.setState({ steps: event.target.value });
    } else {
      mappedAttributes.colorMap[event.target.labels[0].innerText] = { color: event.target.value };
    }
    this.setState({ mappedAttributes });
  }

  addDataAttribute(event) {
    const elements = [...event.target.children];
    let mappedAttributes = {...this.state.mappedAttributes};
    mappedAttributes.dataAttributes = null
    mappedAttributes.dataAttributes = elements.flatMap(item => [item.innerText]);
    this.setState({ mappedAttributes });
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
        <div className="uk-position-fixed uk-text-center Overlay">
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
        <div>
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

            {this.renderSetColors()}

            <h3>Drag and sort data properties for display.</h3>
            <div className="add-data-property">
              <Sort group="sort-group" onAdded={this.addDataAttribute} onRemoved={this.addDataAttribute} onMoved={this.addDataAttribute}  className="uk-flex-center" uk-grid></Sort>
            </div>
            <div className="available-data-properties uk-padding">
              <Sort group="sort-group">
                {this.state.incomingAttributes.map((inAttr, index) => {
                  return (
                    <div className="uk-card uk-card-default uk-card-body uk-card-small uk-text-center" key={`sortAttr-${index}`}>{inAttr}</div>
                  )
                })}
              </Sort>
            </div>

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
        </div>
      )
    } else {
      return (<span></span>)
    }
  }

  renderSetColors() {
    if (this.state.mappedAttributes.colorMap) {
      return (
        <SetColors
          values={this.state.mappedAttributes.colorMap}
          updateColor={this.updateColor}
          isQuantitative={this.state.isQuantitative}
          steps={this.state.steps}
          brew={this.state.brew}
        />
      );
    } else {
      return (
        <span></span>
      );
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
          <Preview data={this.state.geojson} mappedAttributes={this.state.mappedAttributes} isQuantitative={this.state.isQuantitative} />
        </div>
      )
    }
  }

  renderSaveButton() {
    if (this.state.geojson) {
      return (
        <div className="uk-margin">
          <button
            className="uk-button uk-button-large uk-button-primary"
            type="button"
            disabled={this.state.layerTitle == ''}
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