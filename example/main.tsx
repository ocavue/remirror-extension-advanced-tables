import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './Editor';

function App() {
  return (
    <div className='App'>
      <p>
        <strong>demo</strong>
      </p>
      <Editor />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
