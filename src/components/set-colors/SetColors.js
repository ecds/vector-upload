import chroma from 'chroma-js';
import React, { Component } from 'react';

class SetColors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      brewerSchemas: [
        'Blues',
        'BuGn',
        'BuPu',
        'GnBu',
        'Greens',
        'Greys',
        'Oranges',
        'OrRd',
        'PuBu',
        'PuBuGn',
        'PuRd',
        'Purples',
        'Reds',
        'RdPu',
        'Viridis',
        'YlGn',
        'YlGnBu',
        'YlOrBr',
        'YlOrRd'
      ],
      steps: [...Array(10).keys()].slice(2,10),
      selectedStep: 5
    };
  }

  render() {
    if (this.props.isQuantitative) {
      return (
        <div>
          <div className="uk-margin">
            <label htmlFor='steps' className="uk-form-label uk-text-large">
              Number of Steps
            </label>
            <div className="uk-form-controls">
              <select
                name="steps"
                id="steps"
                className="uk-select"
                defaultValue={this.props.steps}
                onChange={this.props.updateColor}
              >
                {this.state.steps.map((step, index) => {
                  return (
                    <option value={step} key={`step-${index}`}>{step}</option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="uk-grid-small uk-flex-center uk-child-width-auto uk-text-center" uk-grid="true">
            {this.state.brewerSchemas.map((schema, index) => {
              return (
                <div key={`schema-${index}`}>
                  <input type="radio" id={`pick-${schema}`} name="schema" value={schema} checked={this.props.brew == schema} onChange={this.props.updateColor} />
                  <label htmlFor={`pick-${schema}`}>
                    {schema}: {chroma.brewer[schema].map((key, index) => {
                      return (
                        <span style={{backgroundColor: key}} key={`${schema}-${index}`}>&nbsp;</span>
                      )
                  })}</label>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      const values = this.props.values;
      return (
        <div className="uk-grid-small uk-flex-center uk-child-width-auto uk-text-center" uk-grid="true">
          {Object.keys(values).map((key, index) => {
            return (
              <div className="uk-display-inline" key={index}>
                <label htmlFor={key} className="uk-padding-small uk-display-inline-block">
                  {key}
                </label>
                  <input type="color" id={key} value={values[key].color} onChange={this.props.updateColor} />
              </div>
            )}
          )}
        </div>
      );
    }
  }
}

export default SetColors;