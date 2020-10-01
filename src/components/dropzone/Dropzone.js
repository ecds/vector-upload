import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons'
import './Dropzone.css';

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = { hightlight: false };
    this.fileInputRef = React.createRef();
    this.openFileDialog = this.openFileDialog.bind(this);
    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  openFileDialog() {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  onFilesAdded(event) {
    console.log("Dropzone -> onFilesAdded -> event", event)
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
            Drag and drop a <em>*.zip</em>, <em>*.json</em>, or <em>*.geojson</em> file here!
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
          </p>
        </div>

        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          accept=".zip,.json,.geojson,application/json"
          onChange={this.onFilesAdded}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default Dropzone;