import React, { Component } from 'react';
import UpdateTitle from './UpdateTitle'
const UIkit = require('uikit');

class Manage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: null,
      pagination: null,
      count: 400,
      offset: 1,
      error: null,
      layerToUpdate: null
    }

    this.confirmDelete = this.confirmDelete.bind(this);
    this.deleteLayer = this.deleteLayer.bind(this);

  }

  componentDidMount() {
    this.fetchLayers();
  }

  async fetchLayers() {
    try {
      let response = await fetch(
        `${process.env.REACT_APP_API_HOST}/vector-layers?page=${this.state.offset}&limit=${this.state.count}`,
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        }
      );
      if (response.ok) {
        let data = await response.json();
        this.setState({
          layers: data.data,
          pagination: data.meta
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

  async confirmDelete(layer) {
    await UIkit.modal.confirm(`Are you sure you want to delete ${layer.attributes.title}?`);
    this.deleteLayer(layer);
  }

  async deleteLayer(layer) {
    try {
      let response = await fetch(
        `${process.env.REACT_APP_API_HOST}/vector-layers/${layer.id}`,
        {
          method: 'DELETE',
          mode: 'cors',
          credentials: 'include'
        }
      );
      if (response.ok) {
        this.fetchLayers();
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

  render() {
    return(
      <div>
        {this.renderLayers()}
      </div>
    )
  }

  renderLayers() {
    if (this.state.layers) {
      return(
        <table className="uk-table uk-table-striped">
          <caption>Manage Data and Place Layers</caption>
          <thead>
            <tr>
              <th>Click Layer Title to Edit</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.layers.map((layer, index) => {
              return (
                <tr key={`layer-${layer.id}`}>
                  <td>
                    <UpdateTitle layer={layer} />
                  </td>
                  <td><a href={`https://atlmaps.ecdsdev.org/layers/${layer.attributes.name}`} target="_blank">View Layer</a></td>
                  <td>
                    <button
                      className="uk-button uk-button-large uk-button-secondary"
                      type="button"
                      onClick={() => this.confirmDelete(layer)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>

                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    } else {
      return(
        <span>loading</span>
      )
    }
  }

  // renderPagination() {
  //   return(
  //     if (this.state.pagination) {
  //       let pagination = []
  //       if (this.state.pagination['prev_page']) {
  //         pagination.push(``)
  //       }
  //       <ul class="uk-pagination" uk-margin>
  //           <li><a href="#"><span uk-pagination-previous></span></a></li>
  //           <li><a href="#">1</a></li>
  //           <li class="uk-disabled"><span>...</span></li>
  //           <li><a href="#">4</a></li>
  //           <li><a href="#">5</a></li>
  //           <li><a href="#">6</a></li>
  //           <li class="uk-active"><span>7</span></li>
  //           <li><a href="#">8</a></li>
  //           <li><a href="#">9</a></li>
  //           <li><a href="#">10</a></li>
  //           <li class="uk-disabled"><span>...</span></li>
  //           <li><a href="#">20</a></li>
  //           <li><a href="#"><span uk-pagination-next></span></a></li>
  //       </ul>
  //     }
  //   )
  // }
}

export default Manage;