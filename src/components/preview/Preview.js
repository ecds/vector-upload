// @flow

import React, { Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'
import Choropleth from 'react-leaflet-choropleth'
import './Preview.css';

class Preview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 33.7490,
      lng: -84.3880,
      zoom: 8,
      bounds: null
    }

    this.previewRef = React.createRef();
    this.mapRef = React.createRef();
    this.layerRef = React.createRef();
    this.onEachFeature = this.onEachFeature.bind(this);
    this.onAdd = this.onAdd.bind(this);

  }

  componentDidMount() {
    if (this.mapRef.current) {
      this.previewRef.current.scrollIntoView();
    }
  }

  onEachFeature(feature: Object, layer: Object) {
    let content = '<table class="uk-table">';
    Object.keys(this.props.mappedAttributes).forEach(attr => {
      if (attr == 'break') {
        content += `<tr><td>Break Property</td><td>${this.props.mappedAttributes[attr]}: ${feature.properties[this.props.mappedAttributes[attr]]}</td></tr>`;
      }
      if (feature.properties[attr]) {
        if (attr == 'dataAttributes') {
          Object.keys(feature.properties.dataAttributes).forEach(datum => {
            console.log("🚀 ~ file: Preview.js ~ line 31 ~ Preview ~ Object.keys ~ datum", datum)
            content += `<tr><td>${datum}</td><td>${feature.properties.dataAttributes[datum]}</td></tr>`;
          })
        } else {
          content += `<tr><td>${attr}</td><td>${feature.properties[attr]}</td></tr>`;
        }
      }
    });
    content += '</table>';
    layer.bindPopup(content, { maxWidth: 800 });
  }

  onAdd() {
    if (this.layerRef.current == null || this.mapRef.current == null) {
      setTimeout(() => {
        this.onAdd();
        return null;
      }, 300);
    } else {
      this.mapRef.current.leafletElement.fitBounds(
        this.layerRef.current.leafletElement.getBounds(),
        {
          padding: [-10, -10]
        }
      );
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <div ref={this.previewRef}>
        <Map
          center={position}
          zoom={this.state.zoom}
          ref={this.mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          />
          {this.renderLayer()}
        </Map>
      </div>
    );
  }

  renderLayer() {
    if (this.props.data.breakProperty) {
      return (
        <Choropleth
          data={this.props.data}
          valueProperty={feature => feature.properties[this.props.data.breakProperty]}
          steps={5}
          scale={['white', 'red']}
          mode="q"
          style={{ color: "#fff", weight: 2, fillOpacity: .8, fillColor: 'red' }}
          onEachFeature={this.onEachFeature}
          onAdd={this.onAdd}
          ref={this.layerRef}
        />
      );
    }
    return (
      <GeoJSON
        ref={this.layerRef}
        data={this.props.data}
        onEachFeature={this.onEachFeature}
        onAdd={this.onAdd}
      />
    )
  }
}

export default Preview
