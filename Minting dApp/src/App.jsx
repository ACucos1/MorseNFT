import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css';
import Morse from './abis/MorseV2.json'
import $ from 'jquery'

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

    this.MorseLoad = this.MorseLoad.bind(this)
    this.textScramble = this.textScramble.bind(this)
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
      if(contract){
        this.setState({contract})
      
        const userBalance = await this.state.contract.methods.balanceOf(this.state.userAccount).call()
        console.log(userBalance)

        const totalSupply = await contract.methods.totalSupply().call()
        this.setState({totalSupply})
      }
      
    }
    else {
      alert('Smart contract not deployed to network')
    }
  }

  MorseLoad(el){
    var m = this;
    
    m.init = function(){
      m.codeletters = "-./";
      m.message = 0;
      m.current_length = 0;
      m.fadeBuffer = false;
      m.messages = [
        'Morse.'
      ];
      
      setTimeout(m.animateIn, 100);
    };
    
    m.generateRandomString = function(length){
      var random_text = '';
      while(random_text.length < length){
        random_text += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
      } 
      
      return random_text;
    };
    
    m.animateIn = function(){
      if(m.current_length < m.messages[m.message].length){
        m.current_length = m.current_length + 2;
        if(m.current_length > m.messages[m.message].length) {
          m.current_length = m.messages[m.message].length;
        }
        
        var message = m.generateRandomString(m.current_length);
        $(el).html(message);
        
        setTimeout(m.animateIn, 20);
      } else { 
        setTimeout(m.animateFadeBuffer, 20);
      }
    };
    
    m.animateFadeBuffer = function(){
      if(m.fadeBuffer === false){
        m.fadeBuffer = [];
        for(var i = 0; i < m.messages[m.message].length; i++){
          m.fadeBuffer.push({c: (Math.floor(Math.random()*12))+1, l: m.messages[m.message].charAt(i)});
        }
      }
      
      var do_cycles = false;
      var message = ''; 
      
      for(i = 0; i < m.fadeBuffer.length; i++){
        var fader = m.fadeBuffer[i];
        if(fader.c > 0){
          do_cycles = true;
          fader.c--;
          message += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
        } else {
          message += fader.l;
        }
      }
      
      $(el).html(message);
      
      if(do_cycles === true){
        setTimeout(m.animateFadeBuffer, 50);
      } else {
        //setTimeout(m.cycleText, 2000);
      }
    };
    
    m.cycleText = function(){
      m.message = m.message + 1;
      if(m.message >= m.messages.length){
        m.message = 0;
      }
      
      m.current_length = 0;
      m.fadeBuffer = false;
      $(el).html('');
      
      setTimeout(m.animateIn, 200);
    };
    
    m.init();
  }

  textScramble(){
    this.MorseLoad($('#morse'))
  }

  async componentDidMount(){
    window.addEventListener('load', this.textScramble)
    await this.loadWeb3()
    await this.loadBlockChainData()
    
  }

  async mint() {
    if(this.state.contract){
      console.log(this.state.contract)
      await this.state.contract.methods.mint(1).send({from: this.state.userAccount})
      

      const totalSupply = await this.state.contract.methods.totalSupply().call()
      this.setState({totalSupply})
    }
    else
      alert("Please connect to Metamask!")
    
  }

  render(){
  return (
    <div className="App">
      <div className="title">
        <h1 id="morse"> </h1>
        <p>Decode the secrets</p>
      </div>

      <div className="content">
        <span><strong>{this.state.userAccount ? this.state.userAccount : "Please connect to Metamask"}</strong></span>
        <div className="numMinted">
          <p>Number of codes minted: <span className="num">{this.state.totalSupply}</span>/10,000</p>
        </div>
        <div className="mint">
          <button className="mintbtn" onClick={() => {this.mint()}}>MINT</button>
        </div>
      </div>
    </div>
  );
}}

export default App;
