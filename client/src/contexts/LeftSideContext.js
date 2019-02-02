import React, { Component } from 'react'
let MyContext
const { Provider, Consumer } = MyContext = React.createContext();
class LeftSideProvider extends Component {
  constructor(props){
    super(props);
    this.state={
      leftCounter: 0,
      rightCounter: 0,
      incrementLeft: this.incrementLeft,
      incrementRight: this.incrementRight
    };
   
  }
  
 
  incrementLeft=()=>{
    this.setState({leftCounter: this.state.leftCounter + 1})
  }
  incrementRight=()=>{
    this.setState({rightCounter: this.state.rightCounter + 1})
  }
  render() {   
    return (
     <Provider value={this.state}>
       {this.props.children}
     </Provider>
    )
  }
}

export { LeftSideProvider, Consumer, MyContext};
