import './MainContent.css';
import { Container } from 'react-bootstrap';

function MainContent(props){
    return (
        <Container className="m-3 main-content row col-4" >
            <Container className="col align-self-start no-padding-left pt-4"><h3>Uniswap V3 pool list</h3></Container>
            <Container className="col-12 no-padding-left p-1">Here is the list of Uniswap V3 liquidity pools</Container>
        </Container>
      );
}

export default MainContent;