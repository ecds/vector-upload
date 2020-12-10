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

    this.mapRef = React.createRef();
    this.layerRef = React.createRef();
    this.onEachFeature = this.onEachFeature.bind(this);
    this.onAdd = this.onAdd.bind(this);

  }

  onEachFeature(feature: Object, layer: Object) {
    let content = '<table class="uk-table">';
    Object.keys(this.props.mappedAttributes).forEach(attr => {
      if (feature.properties[attr]) {
        content += `<tr><td>${attr}</td><td>${feature.properties[attr]}</td></tr>`;
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
