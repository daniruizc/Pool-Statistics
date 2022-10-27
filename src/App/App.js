import React from "react";
import MainTable from "../MainTable/MainTable";
import Header from "../Header/Header";
import MainContent from "../MainContent/MainContent";
import Web3 from 'web3';
import { Container, Alert } from 'react-bootstrap';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        web3: undefined,
        address: '',
        signature: '',
        error: undefined
    };
  }

  async loadWeb3() {
    try {
      // Connect account
      const web3 = new Web3(window.ethereum);
      await this.setState({ web3 });
      this.connect(true);

      // Update on account change
      window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));

    } catch(error) {
      this.setState({
        address: '',
        error: 'An error has ocurred while loading the Wallet provider. Please try again or contact druizcallado@gmail.com if problem persists.'
      });
    }
  }

  async connect(sign = false) {   
    try {
      // Clean error state
      this.setState({ error: undefined });

      const currentAccount = this.state.address; 
      const accounts = await this.state.web3.eth.requestAccounts();
        
      // Save account into state
      await this.setState({ address: accounts[0].toLowerCase() });

      // Sign account
      if(sign && currentAccount === this.state.address) {
        this.sign(accounts[0]);
      }
    } catch (error) {
      this.setState({
        error: 'Connection to this site was rejected by the user. Please click Connect button and select at least one account to continue using this site.'
      });
    }
    
  }

  handleAccountsChanged(accounts) {
    if(accounts.length > 0) {
      this.setState({ address: accounts[0].toLowerCase() });
      this.sign(accounts[0]);
    } else {
      this.setState({ address: '', signature: '' });
    }
    
  }

  async sign(account) {
    try {
      const message = process.env.REACT_APP_SIGN_MESSAGE;
      const hash = this.state.web3.utils.sha3(message);
      const signatureHash = await this.state.web3.eth.personal.sign(hash, account);
      this.setState({ signature: signatureHash });
    } catch(error) {
      this.setState({
        signature: '',
        error: 'Signature was rejected by the user. Please reload the page and accept the message signature.'
      });
    }
    
  }

  setError(error) {
    this.setState({ error });
  }

  componentDidMount() {
    // Load Web3 account
    this.loadWeb3();
  }

  render() {
    return (
      <div className="App">
          {
              this.state.error && 
              <Container className="position-absolute col-auto" style={{'top': 100, 'right': 20, 'zIndex': 999}}>
                  <Alert variant="danger" onClose={() => this.setState({ error: undefined })} dismissible>
                      {this.state.error}
                  </Alert>
              </Container>
          }
          <Header address={this.state.address} onClick={() => this.connect()}/>
          <MainContent/>
          <MainTable address={this.state.address} signature={this.state.signature} setError={(error) => this.setError(error)}/>
      </div>
    );
  }
}

export default App;
