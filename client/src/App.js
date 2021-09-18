import React, { Component } from "react";
// import SimpleMetaTXContract from "./contracts/SimpleMetaTX.json";

import Web3 from "web3";
import getWeb3 from "./getWeb3";

import Caver from "caver-js";

import './App.css'

import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  ListGroupItem,
  ListGroup,
  UncontrolledTooltip,
  Modal, ModalBody
} from "reactstrap";

class App extends Component {
  state = { 
            abi: [
              {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
              },
              {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "delegate",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "hash",
                    "type": "bytes32"
                  }
                ],
                "name": "METATX",
                "type": "event"
              },
              {
                "constant": true,
                "inputs": [],
                "name": "owner",
                "outputs": [
                  {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                  }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
              },
              {
                "constant": false,
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "_owner",
                    "type": "address"
                  }
                ],
                "name": "setOwner",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "constant": false,
                "inputs": [
                  {
                    "internalType": "bytes",
                    "name": "_sig",
                    "type": "bytes"
                  },
                  {
                    "internalType": "address",
                    "name": "_signer",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "_owner",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "_timeStamp",
                    "type": "uint256"
                  }
                ],
                "name": "setOwner",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ],
            web3: null, coinbase: null, 
            chain: "eth", chainId: 3, // ropsten
            jsonInterface: {
              constant: false,
              inputs: [
                {
                  internalType: "address",
                  name: "_owner",
                  type: "address"
                }
              ],
              name: "setOwner",
              outputs: [],
              payable: false,
              stateMutability: "nonpayable",
              type: "function"
            },
            relayerJsonInterface: {
              "constant": false,
              "inputs": [
                {
                  "internalType": "bytes",
                  "name": "_sig",
                  "type": "bytes"
                },
                {
                  "internalType": "address",
                  "name": "_signer",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_owner",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "_timeStamp",
                  "type": "uint256"
                }
              ],
              "name": "setOwner",
              "outputs": [],
              "payable": false,
              "stateMutability": "nonpayable",
              "type": "function"
            },

            ethProvider: null, ethContractAddress: "0x01cdFd32E001BD837BCf174C133b4086ef6e87E9", 
            ethContractInstance: null, ethOwner: "", ethTimestamp: 0, ethSignature: "", ethRelayer: "", ethRelayerBalance: 0,

            maticProvider: null, maticContractAddress: "0xa716C85AD3FeDb9C8f77D8EBA3c30c2a764A6BCb", 
            maticContractInstance: null, maticOwner: "", maticTimestamp: 0, maticSignature: "", maticRelayer: "", maticRelayerBalance: 0,

            celoProvider: null, celoContractAddress: "0x01cdFd32E001BD837BCf174C133b4086ef6e87E9", 
            celoContractInstance: null, celoOwner: "", celoTimestamp: 0, celoSignature: "", celoRelayer: "", celoRelayerBalance: 0,

            klayProvider: null, klayContractAddress: "0x01cdFd32E001BD837BCf174C133b4086ef6e87E9", 
            klayContractInstance: null, klayOwner: "", klayTimestamp: 0, klaySignature: "", klayRelayer: "", klayRelayerBalance: 0,

            modal: false,
            url: "",
            display: "none",
            Kit: require('@celo/contractkit')
          };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      const self = this  
      window.ethereum.on("accountsChanged", function(accounts) {
        self.setState({ coinbase: accounts[0] });
      });

      // Set ETH Provider
      const eth = new Web3.providers.HttpProvider(
        "https://ropsten.infura.io/v3/b2ad306cee024ab0a9059f807b86ae53"
      );
      const ethProvider = new Web3(eth);

      // Set Relayer ETH Wallet
      const ethWalletInstance = ethProvider.eth.accounts.privateKeyToAccount(
        "0x0bf8b938ea5bb7b3eb0149a27de7f8a4387975685e11161a9212705104197917"
      );
      ethProvider.eth.accounts.wallet.add(ethWalletInstance);
      
      const ethRelayer = ethProvider.eth.accounts.wallet[0].address;
      
      // Get ETH Relayer balance
      const ethRelayerBalance = ethProvider.utils.fromWei(await ethProvider.eth.getBalance(ethRelayer))

      // Set ETH contract
      const ethContractInstance = new ethProvider.eth.Contract(
        this.state.abi,
        this.state.ethContractAddress
      );
      
      // Set ETH contract owner
      const ethOwner = await ethContractInstance.methods.owner().call();

      // Set KLAY Provider
      const klayProvider = await new Caver("https://api.baobab.klaytn.net:8651/");
      
      // Set Relayer KLAY Wallet
      const kalyWalletInstance = klayProvider.klay.accounts.privateKeyToAccount(
        "0x0bf8b938ea5bb7b3eb0149a27de7f8a4387975685e11161a9212705104197917"
      );

      klayProvider.klay.accounts.wallet.add(kalyWalletInstance);

      const klayRelayer = klayProvider.klay.accounts.wallet[0].address;
      
      // Get KLAY Relayer balance
      const klayRelayerBalance = klayProvider.utils.fromWei(await klayProvider.klay.getBalance(klayRelayer))

      // Set KLAY contract
      const klayContractInstance = new klayProvider.klay.Contract(
        this.state.abi,
        this.state.klayContractAddress
      );
      
      // Set KLAY contract owner
      const klayOwner = await klayContractInstance.methods.owner().call();

      // Set CELO Provider
      const celoProvider = this.state.Kit.newKit('https://alfajores-forno.celo-testnet.org')

      // Set Relayer CELO Wallet
      celoProvider.addAccount('0x0bf8b938ea5bb7b3eb0149a27de7f8a4387975685e11161a9212705104197917')

      let celoAccounts = await celoProvider.web3.eth.getAccounts()
      const celoRelayer = celoAccounts[0]

      // Get CELO Relayer balance
      let goldtoken = await celoProvider.contracts.getGoldToken()
      let celoRelayerBalance = celoProvider.web3.utils.fromWei((await goldtoken.balanceOf(celoRelayer)).toString())

      // Set CELO contract
      const celoContractInstance = new celoProvider.web3.eth.Contract(
        this.state.abi,
        this.state.celoContractAddress
      )

      // Set CELO contract owner
      const celoOwner = await celoContractInstance.methods.owner().call();

      // Set MATIC Provider
      const polygon = new Web3.providers.HttpProvider(
        "https://rpc-mumbai.matic.today"
      );
      const maticProvider = new Web3(polygon);

      // Set Relayer MATIC Wallet
      const maticWalletInstance = maticProvider.eth.accounts.privateKeyToAccount(
        "0x0bf8b938ea5bb7b3eb0149a27de7f8a4387975685e11161a9212705104197917"
      );
      maticProvider.eth.accounts.wallet.add(maticWalletInstance);
      
      const maticRelayer = maticProvider.eth.accounts.wallet[0].address;
      
      // Get MATIC Relayer balance
      const maticRelayerBalance = maticProvider.utils.fromWei(await maticProvider.eth.getBalance(maticRelayer))

      // Set MATIC contract
      const maticContractInstance = new maticProvider.eth.Contract(
        this.state.abi,
        this.state.maticContractAddress
      );

      // Set MATIC contract owner
      const maticOwner = await maticContractInstance.methods.owner().call();

      this.setState(
        { 
          web3, 
          coinbase: accounts[0], 
          ethContractInstance, ethProvider, ethRelayer, ethRelayerBalance, ethOwner,
          klayContractInstance, klayProvider, klayRelayer, klayRelayerBalance, klayOwner,
          celoContractInstance, celoProvider, celoRelayer, celoRelayerBalance, celoOwner,
          maticContractInstance, maticProvider, maticRelayer, maticRelayerBalance, maticOwner
        }
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  refresh = async (chain) => {

    switch(chain){
      case 'eth':
        const ethProvider = this.state.ethProvider
        const ethRelayerBalance = ethProvider.utils.fromWei(await this.getRelayerBalance('eth'));
        const ethOwner = await this.getOwner('eth');
        this.setState({ ethRelayerBalance, ethOwner, modal: false, display: 'none' })
      break;
      case 'klay':
        const klayProvider = this.state.klayProvider
        const klayRelayerBalance = klayProvider.utils.fromWei(await this.getRelayerBalance('klay'));
        const klayOwner = await this.getOwner('klay');
        this.setState({ klayRelayerBalance, klayOwner, modal: false, display: 'none' })
      break;
      case 'celo':
        const celoProvider = this.state.celoProvider
        const celoRelayerBalance = celoProvider.web3.utils.fromWei(await this.getRelayerBalance('celo'));
        const celoOwner = await this.getOwner('celo');
        this.setState({ celoRelayerBalance, celoOwner, modal: false, display: 'none' })
      break;
      case 'polygon':
        const maticProvider = this.state.maticProvider
        const maticRelayerBalance = maticProvider.utils.fromWei(await this.getRelayerBalance('polygon'));
        const maticOwner = await this.getOwner('polygon');
        this.setState({ maticRelayerBalance, maticOwner, modal: false, display: 'none' })
      break;
    }
  }

  getRelayerBalance = async (chain) => {
    
    switch(chain){
      case 'eth':
        const {ethProvider, ethRelayer} = this.state;
        const ethRelayerBalance = await ethProvider.eth.getBalance(ethRelayer);
        return ethRelayerBalance;
      break;
      case 'klay':
        const {klayProvider, klayRelayer} = this.state;
        const klayRelayerBalance = await klayProvider.klay.getBalance(klayRelayer);
        return klayRelayerBalance;
      break;
      case 'celo':
        const {celoProvider, celoRelayer} = this.state;
        let goldtoken = await celoProvider.contracts.getGoldToken()
        let celoRelayerBalance = (await goldtoken.balanceOf(celoRelayer)).toString()
        return celoRelayerBalance;
      break;
      case 'polygon':
        const {maticProvider, maticRelayer} = this.state;
        const maticRelayerBalance = await maticProvider.eth.getBalance(maticRelayer);
        return maticRelayerBalance;
      break;
    }
  }

  getOwner = async (chain) => {
    switch(chain){
      case 'eth':
        const ethContractInstance  = this.state.ethContractInstance;
        const ethOwner = await ethContractInstance.methods.owner().call();
        return ethOwner;
      break;
      case 'klay':
        const klayContractInstance  = this.state.klayContractInstance;
        const klayOwner = await klayContractInstance.methods.owner().call();
        return klayOwner;
      break;
      case 'celo':
        const celoContractInstance  = this.state.celoContractInstance;
        const celoOwner = await celoContractInstance.methods.owner().call();
        return celoOwner;
      break;
      case 'polygon':
        const maticContractInstance  = this.state.maticContractInstance;
        const maticOwner = await maticContractInstance.methods.owner().call();
        return maticOwner;
      break;
    }
  };
  
  sign = async (chain, chainId) => {

    console.log(chain, chainId)

    const { web3, jsonInterface, coinbase } = this.state

    const timestamp = new Date().getTime();
    const data = web3.eth.abi.encodeFunctionCall(jsonInterface, [
      coinbase
    ]);

    const hex =
      data + web3.utils.padLeft(web3.utils.toHex(timestamp), 64).slice(2);

    switch(chain){
      case 'eth':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ ethTimestamp: timestamp, ethSignature: signature }, ()=>{this.metaTx(chain)})
          })
      break;
      case 'klay':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ klayTimestamp: timestamp, klaySignature: signature }, ()=>{this.metaTx(chain)})
          })
      break;
      case 'celo':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ celoTimestamp: timestamp, celoSignature: signature }, ()=>{this.metaTx(chain)})
          })
      break;
      case 'polygon':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ maticTimestamp: timestamp, maticSignature: signature }, ()=>{this.metaTx(chain)})
          })
      break;
    }
  }

  metaTx = async (chain) => {
    console.log('metaTx: ' + chain)
    const { coinbase, relayerJsonInterface } = this.state
    let data, gas;
    const self = this;

    switch(chain){
      case 'eth':
        const { ethProvider, ethSignature, ethTimestamp, ethContractAddress, ethRelayer} = this.state

        data = ethProvider.eth.abi.encodeFunctionCall(relayerJsonInterface, [
          ethSignature,
          coinbase,
          coinbase,
          ethTimestamp
        ]);
    
        gas = await ethProvider.eth.estimateGas({
          from: ethRelayer,
          to: ethContractAddress,
          data,
        })
        
        ethProvider.eth.sendTransaction({
          from: ethRelayer,
          to: ethContractAddress,
          data,
          gas: parseInt(gas * 1.5)
        })
        .on('transactionHash', function(hash){
          console.log('txhash: '+hash)
          self.toggleModal("https://ropsten.etherscan.io/tx/"+hash)
        })
        .on('receipt', function(receipt){
          console.log(receipt)
          self.refresh('eth')
        })
        
      break;
      case 'klay':
        const { klayProvider, klaySignature, klayTimestamp, klayContractAddress, klayRelayer} = this.state

        data = klayProvider.klay.abi.encodeFunctionCall(relayerJsonInterface, [
          klaySignature,
          coinbase,
          coinbase,
          klayTimestamp
        ]);
    
        gas = await klayProvider.klay.estimateGas({
          from: klayRelayer,
          to: klayContractAddress,
          data
        })
        
        klayProvider.klay.sendTransaction({
          type: "SMART_CONTRACT_EXECUTION",
          from: klayRelayer,
          to: klayContractAddress,
          data,
          gas: parseInt(gas * 1.5)
        })
        .on('transactionHash', function(hash){
          console.log('txhash: '+hash)
          self.toggleModal("https://baobab.scope.klaytn.com/tx/"+hash)
        })
        .on('receipt', function(receipt){
          console.log(receipt)
          self.refresh('klay')
        })
        
      break;
      case 'celo':
        const { celoProvider, celoSignature, celoTimestamp, celoContractAddress, celoRelayer} = this.state

        data = celoProvider.web3.eth.abi.encodeFunctionCall(relayerJsonInterface, [
          celoSignature,
          coinbase,
          coinbase,
          celoTimestamp
        ]);
        
        const tx = await celoProvider.sendTransaction({
          from: celoRelayer,
          to: celoContractAddress,
          data
        })

        const hash = await tx.getHash()
        console.log('txhash: '+hash)
        self.toggleModal("https://alfajores-blockscout.celo-testnet.org/tx/"+hash)

        const receipt = await tx.waitReceipt()
        console.log(receipt)
        self.refresh('celo')

      break;
      case 'polygon':
        const { maticProvider, maticSignature, maticTimestamp, maticContractAddress, maticRelayer} = this.state

        data = maticProvider.eth.abi.encodeFunctionCall(relayerJsonInterface, [
          maticSignature,
          coinbase,
          coinbase,
          maticTimestamp
        ]);
    
        gas = await maticProvider.eth.estimateGas({
          from: maticRelayer,
          to: maticContractAddress,
          data
        })
        
        maticProvider.eth.sendTransaction({
          from: maticRelayer,
          to: maticContractAddress,
          data,
          gas: parseInt(gas * 1.5)
        })
        .on('transactionHash', function(hash){
          console.log('txhash: '+hash)
          self.toggleModal("https://mumbai.polygonscan.com/tx/"+hash)
        })
        .on('receipt', function(receipt){
          console.log(receipt)
          self.refresh('polygon')
        })
        
      break;
    }
  }

  toggleModal = (url) => {

    let display = this.state.display

    display == 'none' ? display = 'block': display = 'none';

    this.setState({
      modal: !this.state.modal,
      url,
      display
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="wrapper">
          <div className="">
            <div className="" style={{margin: '100px', marginBottom: '0px'}}>
              <h1 className="h1-seo"><a href="https://github.com/daoauth/EIPs/blob/master/EIPS/eip-2462.md" target="_blank">EIP-2462 Example</a></h1>
              <h3 className="d-sm-block">1. Choose chain and just sign JSON interface by using ONLY Metamask</h3>
              <img
                style={{width: '500px', marginBottom: '50px'}}
                src={require("./assets/img/json.PNG")}
              />
              <h3 className="d-sm-block">2. Relayer pay gas fee and send a transaction to the blockchain of your choice</h3>
              <img
                style={{width: '700px', marginBottom: '50px'}}
                src={require("./assets/img/function.PNG")}
              />   
              <h3 className="d-sm-block">3. You don't need to pay gas fee 👍</h3>
              <img
                style={{width: '600px', marginBottom: '20px'}}
                src={require("./assets/img/relayer.png")}
              />
            </div>
            <div className="section section-basic" id="basic-elements">
              <Container>
                <Row style={{ marginBottom: "150px" }}>
                  <Col>
                    <hr className="line-info" />
                    <h1>
                      Choose the blockchain{" "}
                      <span className="text-info">and sign JSON interface</span>
                    </h1>   
                    <p>* When you click the sign button, the relayer sends meta tx to call setOwner function, and your address becomes the owner.</p>
                    
                  </Col>
                </Row>
                <Row>
                  <Col md="6" style={{ marginBottom: "60px" }}>
                    <Card className="card-coin card-plain" style={{ minHeight: 300 }}>
                      <CardHeader>
                        <img
                          alt="..."
                          className="img-center img-fluid"
                          src={require("./assets/img/eth.png")}
                        />
                      </CardHeader>
                      <CardBody style={{ marginTop: 23 }}>
                        <Row>
                          <Col className="text-center" md="12">
                            <h4 className="text-uppercase">Ethereum</h4>
                            <p>Contract Address: 
                              <a href={"https://ropsten.etherscan.io/address/"+this.state.ethContractAddress} target="_blank">
                                {" "+this.state.ethContractAddress}
                              </a>
                            </p>
                            <hr className="line-success" />
                            <p>Relayer: {this.state.ethRelayer}</p>
                            <p>Balance: {this.state.ethRelayerBalance} ETH</p>
                            <hr className="line-success" />
                            <h4 style={{fontWeight: "bold"}}>Owner: {this.state.ethOwner}</h4>
                          </Col>
                        </Row>
                        <Row>
                            <ListGroup>
                              <ListGroupItem></ListGroupItem>
                                <ListGroupItem>
                                  <Button
                                    className="btn-simple"
                                    color="success"
                                    onClick={()=>{this.sign('eth', 3)}}
                                  >
                                    Sign
                                  </Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6" style={{ marginBottom: "150px" }}>
                    <Card className="card-coin card-plain" style={{ minHeight: 300 }}>
                      <CardHeader>
                        <img
                          alt="..."
                          className="img-center img-fluid"
                          src={require("./assets/img/polygon.png")}
                        />
                      </CardHeader>
                      <CardBody style={{ marginTop: 23 }}>
                        <Row>
                          <Col className="text-center" md="12">
                            <h4 className="text-uppercase">Polygon</h4>
                            <p>Contract Address: 
                              <a href={"https://mumbai.polygonscan.com/address/"+this.state.maticContractAddress} target="_blank">
                                {" "+this.state.maticContractAddress}
                              </a>
                            </p>
                            <hr className="line-success" />
                            <p>Relayer: {this.state.maticRelayer}</p>
                            <p>Balance: {this.state.maticRelayerBalance} MATIC</p>
                            <hr className="line-success" />
                            <h4 style={{fontWeight: "bold"}}>Owner: {this.state.maticOwner}</h4>
                          </Col>
                        </Row>
                        <Row>
                            <ListGroup>
                              <ListGroupItem></ListGroupItem>
                                <ListGroupItem>
                                  <Button
                                    className="btn-simple"
                                    color="success"
                                    onClick={()=>{this.sign('polygon', 80001)}}
                                  >
                                    Sign
                                  </Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Row>
                      </CardBody>                      
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col md="6" style={{ marginBottom: "60px" }}>
                    <Card className="card-coin card-plain" style={{ minHeight: 300 }}>
                      <CardHeader>
                        <img
                          alt="..."
                          className="img-center img-fluid"
                          src={require("./assets/img/celo.png")}
                        />
                      </CardHeader>
                      <CardBody style={{ marginTop: 23 }}>
                        <Row>
                          <Col className="text-center" md="12">
                            <h4 className="text-uppercase">Celo</h4>
                            <p>Contract Address: 
                              <a href={"https://alfajores-blockscout.celo-testnet.org/address/"+this.state.celoContractAddress} target="_blank">
                                {" "+this.state.celoContractAddress}
                              </a>
                            </p>
                            <hr className="line-success" />
                            <p>Relayer: {this.state.celoRelayer}</p>
                            <p>Balance: {this.state.celoRelayerBalance} CELO</p>
                            <hr className="line-success" />
                            <h4 style={{fontWeight: "bold"}}>Owner: {this.state.celoOwner}</h4>
                          </Col>
                        </Row>
                        <Row>
                            <ListGroup>
                              <ListGroupItem></ListGroupItem>
                                <ListGroupItem>
                                  <Button
                                    className="btn-simple"
                                    color="success"
                                    onClick={()=>{this.sign('celo', 44787)}}
                                  >
                                    Sign
                                  </Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Row>
                      </CardBody> 
                    </Card>
                  </Col>
                  <Col md="6" style={{ marginBottom: "60px" }}>
                    <Card className="card-coin card-plain" style={{ minHeight: 300 }}>
                      <CardHeader>
                        <img
                          alt="..."
                          className="img-center img-fluid"
                          src={require("./assets/img/klaytntr.png")}
                          style={{marginBottom: "23px"}}
                        />
                      </CardHeader>
                      <CardBody style={{ marginTop: 23 }}>
                        <Row>
                          <Col className="text-center" md="12">
                            <h4 className="text-uppercase">Klaytn</h4>
                            <p>Contract Address: 
                              <a href={"https://baobab.scope.klaytn.com/account/"+this.state.klayContractAddress} target="_blank">
                                {" "+this.state.klayContractAddress}
                              </a>
                            </p>
                            <hr className="line-success" />
                            <p>Relayer: {this.state.klayRelayer}</p>
                            <p>Balance: {this.state.klayRelayerBalance} KLAY</p>
                            <hr className="line-success" />
                            <h4 style={{fontWeight: "bold"}}>Owner: {this.state.klayOwner}</h4>
                          </Col>
                        </Row>
                        <Row>
                            <ListGroup>
                              <ListGroupItem></ListGroupItem>
                                <ListGroupItem>
                                  <Button
                                    className="btn-simple"
                                    color="success"
                                    onClick={()=>{this.sign('klay', 1001)}}
                                  >
                                    Sign
                                  </Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Row>
                      </CardBody> 
                    </Card>
                  </Col>
                </Row>
                <Row className="row-grid align-items-center my-md">
                  <Col lg="6">
                    <h3 className="text-info font-weight-light mb-2">
                      Thank you for visiting!
                    </h3>
                    <h4 className="mb-0 font-weight-light">
                      Let's get in touch on any of these platforms.
                    </h4>
                  </Col>
                  <Col className="text-lg-center btn-wrapper" lg="6">
                      <h4><a href="https://github.com/hsy822/eip2462-sample" target="_blank">Github</a></h4>
                  </Col>
                </Row>
              </Container>
              
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Transaction sent
            </h5>
          </div>
          <ModalBody>
            <p>Please wait...</p>
            <p></p>
            <a href={this.state.url} target="_blank">View on Explorer</a>
          </ModalBody>
          {/* <ModalFooter>
            <Button color="secondary" onClick={this.toggleModalDemo}>
              Close
            </Button>
          </ModalFooter> */}
        </Modal>
        <div style={{
          display: this.state.display, /* Hidden by default */
          position: "fixed", /* Stay in place */
          zIndex: 1, /* Sit on top */
          left: 0,
          top: 0,
          width: "100%", /* Full width */
          height: "100%", /* Full height */
          overflow: "auto", /* Enable scroll if needed */
          backgroundColor: "rgb(0,0,0)", /* Fallback color */
          backgroundColor: "rgba(0,0,0,0.4)", /* Black w/ opacity */
        }}> 
        </div>
      </div>  
    );
  }
}

export default App;