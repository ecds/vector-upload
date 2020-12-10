import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons'
import './Dropzone.css';

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = { hightlight: false, url: null };
    this.fileInputRef = React.createRef();
    this.openFileDialog = this.openFileDialog.bind(this);
    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onUrlSubmit = this.onUrlSubmit.bind(this);
    this.updateUrl = this.updateUrl.bind(this);
  }

  openFileDialog() {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  onFilesAdded(event) {
    if (this.props.disabled) return;
    const file = event.target.files[0];
    if (this.props.onFilesAdded) {
      // const array = this.fileListToArray(files);
      this.props.onFilesAdded(file);
    }
  }

  onDragOver(event) {
    event.preventDefault();
    if (this.props.disabled) return;
    this.setState({ hightlight: true });
  }

  onDragLeave() {
    this.setState({ hightlight: false });
  }

  onDrop(event) {
    event.preventDefault();

    if (this.props.disabled) return;

    const file = event.dataTransfer.files[0];
    if (this.props.onFilesAdded) {
      // const array = this.fileListToArray(files);
      this.props.onFilesAdded(file);
    }
    this.setState({ hightlight: false });
  }

  onUrlSubmit(event) {
    this.props.fetchFromUrl(this.state.url);
    event.preventDefault();
  }

  updateUrl(event) {
    this.setState({ url: event.target.value });
  }

  fileListToArray(list) {
    const array = [];
    for (var i = 0; i < list.length; i++) {
      array.push(list.item(i));
    }
    return array;
  }

  render() {
    return (
      <div>
        <div
          className={`Dropzone ${this.state.hightlight ? "Highlight" : ""} uk-card uk-card-default uk-card-body uk-text-center`}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
          style={{ cursor: this.props.disabled ? "default" : "pointer" }}
        >
          <p>
            <FontAwesomeIcon icon={faFileImport} />
          </p>
          <p>
            Drag and drop a <em>*.zip</em>, <em>*.xlsx</em>, <em>*.json</em>, or <em>*.geojson</em> file here!
          </p>
          <p>
            or
          </p>
          <p>
          <button
            className="uk-button uk-button-primary uk-button-large"
            onClick={this.openFileDialog}
          >
            Choose File
          </button>
          {/* <button className="uk-button-secondary uk-button-large" onClick={this.onDrop}>Upload File</button> */}
          </p>
          <p>
            or
          </p>
          <form onSubmit={this.onUrlSubmit}>
            <p>
              <input type="url" placeholder="Add URL" className="uk-input uk-text-center" onChange={this.updateUrl} />
            </p>
            <p>
              <button className="uk-button uk-button-secondary" type="submit">Fetch GeoJSON</button>
            </p>
          </form>
        </div>

        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          accept=".zip,.json,.geojson,application/json,.xlsx,.csv"
          onChange={this.onFilesAdded}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default Dropzone;