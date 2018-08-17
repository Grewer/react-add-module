import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Foo from './foo'
import Loadable from 'react-loadable';

function Loading(props) {
  if (props.error) {
    return <div>Error! <button onClick={props.retry}>Retry</button></div>;
  } else if (props.timedOut) {
    return <div>Taking a long time... <button onClick={props.retry}>Retry</button></div>;
  } else if (props.pastDelay) {
    return <div>Loading...</div>;
  } else {
    return null;
  }
}

const LoadableComponent = Loadable({
  loader: () => import('./my-component'),
  loading: Loading,
});

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <LoadableComponent/>
        <Foo/>
      </div>
    );
  }
}

export default App;
