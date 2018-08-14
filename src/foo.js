import React from 'react';

class Foo extends React.Component {
  sleep = (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('success');
      }, time);
    })
  };

  async componentDidMount() {
    let result = await this.sleep(3000);
    console.log(result);
  }

  render() {
    return (<div>Foo</div>);
  }
}

export default Foo;
