import React from 'react';

class MyComponent extends React.Component {
  async componentDidMount() {
    let result = await this.setVal();
    console.log(result)
  }

  setVal() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('success')
      }, 1000)
    })
  }

  render() {
    return (<div>MyComponent</div>);
  }
}

export default MyComponent;
