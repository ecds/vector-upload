import React from 'react';
import logo from './logo.svg';
import './App.css';
import Upload from './components/upload/Upload';

function App() {
  return (
    <div className="App uk-container uk-margin-top">
      <div className="Card">
        <Upload />
      </div>
    </div>
  );
}

export default App;
