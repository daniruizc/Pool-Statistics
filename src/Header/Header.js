import './Header.css';
import {
    Container, 
    Navbar, 
    Nav,
    Button
} from 'react-bootstrap';

function formatAddress(address) {
    return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

function Header(props){
    return (
        <Navbar className="py-2 header">
            <Container fluid className="px-4">
                <Navbar.Brand href="#" className="text-light fs-2">Pools Analytics</Navbar.Brand>
                {
                    props.address !== '' ?
                        <Nav.Link href="#" className="text-light fs-5">{formatAddress(props.address)}</Nav.Link> :
                        <Button className="transparent text-light fs-5" onClick={props.onClick}>Connect</Button>
                }
            </Container>
        </Navbar>
      );
}

export default Header;