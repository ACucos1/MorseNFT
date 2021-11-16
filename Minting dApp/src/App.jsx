import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css';
import Morse from './abis/MorseV2.json'

class App extends Component{
  constructor(props){
    super(props)
    
    this.state = {
      userAccount: '',
      contract: null,
      totalSupply: 0,
      codes: [],
      ownedTokens: []
    }

  }

  async loadWeb3(){
    if(!window.ethereum){
      alert('No Ethereum client detected, try MetaMask!')
      return
    }
  }

  async loadBlockChainData(){
    const web3 = new Web3(Web3.givenProvider)
    let accounts = await window.ethereum.request({ method :'eth_requestAccounts' })
    let user = accounts[0]
    this.setState({
      userAccount: user
    })
    const networkId = await web3.eth.net.getId()
    const networkData = Morse.networks[networkId]

    if(networkData){
      //console.log(networkData)
      const abi = Morse.abi
      const contractAddress = networkData.address
      var contract = await new web3.eth.Contract(abi, contractAddress)
      this.setState({contract})
      
      const userBalance = await this.state.contract.methods.balanceOf(this.state.userAccount).call()
      console.log(userBalance)

      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({totalSupply})
    }
    else {
      alert('Smart contract not deployed to network')
    }
  }

  async componentDidMount(){
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  async mint() {
    console.log(this.state.contract)
    await this.state.contract.methods.mint(1).send({from: this.state.userAccount})
    

    const totalSupply = await this.state.contract.methods.totalSupply().call()
    this.setState({totalSupply})
  }

  render(){
  return (
    <div className="App">
      <div className="content">
        <span><strong>{this.state.userAccount}</strong></span>
        <div className="numMinted">
          <p>Number of codes minted: <span className="num">{this.state.totalSupply}/200</span></p>
        </div>
        <div className="mint">
          <button className="mintbtn" onClick={() => {this.mint()}}>MINT</button>
        </div>
      </div>
    </div>
  );
}}

export default App;
