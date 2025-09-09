import React from 'react';
import './App.css';
import IframePage from './components/IframePage';
import AICodeSuggestion from './components/AICodeSuggestion';
import ApiTest from './components/ApiTest';

function App() {
  return (
    <div className="App">
      <IframePage />

      <AICodeSuggestion />
      {/* <ApiTest /> */}
    </div>
  );
}

export default App;
