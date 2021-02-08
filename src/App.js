import React from 'react';
import logo from './logo.svg';
import './App.css';
import Upload from './components/upload/Upload';
import Switcher from './components/switcher/Switcher';
import Manage from './components/manage/Manage';

function App() {
  return (
    <div className="App uk-container uk-margin-top">
      <div className="Card">
        <Switcher>
          <li><a href="#">Upload</a></li>
          <li><a href="#">Manage</a></li>
        </Switcher>
        <ul className="uk-switcher uk-margin">
          <li>
            <Upload />
          </li>
          <li>
            <Manage />
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
