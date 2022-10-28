import React from "react";
import './MainTable.css';
import { 
    Container,
    Tab, 
    Tabs,
    Table,
    Col,
    Row,
    OverlayTrigger,
    Tooltip,
    Button,
    Spinner
} from "react-bootstrap";
import {
    DatatableWrapper,
    Filter,
    Pagination,
    PaginationOptions,
    TableBody,
    TableHeader
} from 'react-bs-datatable';
import {
    BsStar,
    BsStarFill,
    BsXCircle,
    BsXCircleFill
} from "react-icons/bs";

class MainTable extends React.Component {

    constructor(props) {
        super(props);

        this.defaultTab = 'allPools';

        this.state = {
            allPools: [],
            whitelisted: [],
            blacklisted: [],
            tabSelected: this.defaultTab,
            checked: {},
            loading: false
        };
    }

    async fetchPools(poolType) {
        try{

            let response, allPools, whitelistData, whitelistPools, blacklistData, blacklistPools;

            // Fetch whitelisted pools
            response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/pools/whitelisted/${this.props.address}`, {
                headers: { 'signature': this.props.signature },
            });

            if(!response.ok){
                this.props.setError('An error has ocurred while fetching your whitelisted pools. Please try again later or contact druizcallado@gmail.com if problem persists.');
                whitelistData = [];
            } else {
                const data = await response.json();
                whitelistData = data.data;
            }

            // Fetch blacklisted pools
            response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/pools/blacklisted/${this.props.address}`, {
                headers: { 'signature': this.props.signature },
            });

            if(!response.ok){
                this.props.setError('An error has ocurred while fetching your blacklisted pools. Please try again later or contact druizcallado@gmail.com if problem persists.');
                blacklistData = [];
            } else {
                const data = await response.json();
                blacklistData = data.data;
            }
            
            // Fetch all pools
            response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/pools?sort=APR.daily`, {
                headers: { 'signature': this.props.signature },
            });

            if(!response.ok){
                this.props.setError('An error has ocurred while fetching all pools. Please try again later or contact druizcallado@gmail.com if problem persists.');
                allPools = [];
            } else {
                const data = await response.json();
                allPools = data.data;
            }

            // Reset checked buttons because we are going to check them again
            this.setState({ checked: {} });

            // Get whitelist and blacklist pools from allPools array
            whitelistPools = allPools.filter((pool) => {
                return whitelistData.filter((whitePool) => {
                    // Activate whitelist button for whitelisted pools
                    if(pool.poolId === whitePool.poolId) {
                        this.changeIconState(pool.poolId, 'fav', true);
                    }

                    return pool.poolId === whitePool.poolId;
                }).length > 0;
            });
            
            blacklistPools = allPools.filter((pool) => {
                return blacklistData.filter((blackPool) => {
                    // Activate blacklist button for blacklisted pools
                    if(pool.poolId === blackPool.poolId) {
                        this.changeIconState(pool.poolId, 'del', true);
                    }

                    return pool.poolId === blackPool.poolId;
                }).length > 0;
            });
            
            // Update state and DOM
            this.setState({ allPools: allPools });
            this.setState({ whitelisted: whitelistPools });
            this.setState({ blacklisted: blacklistPools });

            // Hide loading
            this.setState({ loading: false });
        
        } catch(error) {
            this.props.setError('An error has ocurred while fetching pools. Please try again later or contact druizcallado@gmail.com if problem persists.');
        }
    }

    async handleActionClick(event, action, poolId) {

        try {
            // Compose post data
            let postData = {
                poolId
            };
            
            // Next value based on current state
            const value = (this.state.checked[poolId] && this.state.checked[poolId][action]) ? !this.state.checked[poolId][action] : true;

            switch(action) {
                case 'fav':
                    postData['type'] = 'whitelist';
                    break;
                case 'del':
                    postData['type'] = 'blacklist';
                    break;
                default:
                    break;
            }

            // If value is true, we are adding to whitelist or blacklist
            let response;
            if(value) {
                response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/pools`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'signature': this.props.signature
                    },
                    body: JSON.stringify(postData)
                });

            // Otherwise, we are removing from whitelist or blacklist
            } else {
                response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/pools/${poolId}/${postData['type']}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'signature': this.props.signature
                    }
                });
            }

            if(!response.ok){
                this.props.setError('An error has ocurred while performing this action. Please try again later or contact druizcallado@gmail.com if problem persists.');
                
            } else {
                // Update icon state
                this.changeIconState(poolId, action, value);

                // Fetch pools to update with the new info
                this.fetchPools();
            }
        
        } catch(error) {
            this.props.setError('An error has ocurred while performing this action. Please try again later or contact druizcallado@gmail.com if problem persists.');
        }
        
    }

    changeIconState(poolId, action, value) {
        // Activate icon by modifying the state
        this.setState(prevState => {
            let checked = { ...prevState.checked };
            if(!checked[poolId]) checked[poolId] = {};
            checked[poolId][action] = value;
            return { checked };
        });
    }

    cleanTables() {
        this.setState({
            allPools: [],
            whitelisted: [],
            blacklisted: [],
            checked: {},
            loading: false
        });
    }

    componentDidUpdate(prevProps) {
        if(this.props.signature !== prevProps.signature) {

            // Empty table if no signature
            if(this.props.signature === '') {
                this.cleanTables();
                this.props.setError('There is no account connected. Please connect an account to continue using this site.');
            } else {
                // Show loading
                this.setState({ loading: true });

                // Fetch pools
                this.fetchPools();
            }
        }
    }

    render(){

        // Headers of the table
        const headers = [
            { title: 'Pair', prop: 'pair', isFilterable: true, isSortable: true },
            { title: 'TVL', prop: 'TVL', isSortable: true },
            { title: 'Yesterday Volume', prop: 'dailyVolume', isSortable: true },
            { title: 'Yesterday Fees', prop: 'dailyFee', isSortable: true },
            { title: 'Daily APR', prop: 'dailyAPR', isSortable: true },
            { title: 'Weekly APR', prop: 'weeklyAPR', isSortable: true },
            { title: 'Monthly APR', prop: 'monthlyAPR', isSortable: true },
            {
                title: 'Whitelist',
                prop: "button",
                cell: (row) => (
                    <OverlayTrigger
                        placement="top"
                        overlay={(props) => (
                            <Tooltip {...props}>Add to whitelist</Tooltip>
                        )}
                    >
                        <Button className="py-0 my-0 transparent"
                            onClick={event => this.handleActionClick(event, 'fav', row.poolId)}
                        >
                    {
                        (this.state.checked[row.poolId] && this.state.checked[row.poolId]['fav']) ?
                        <BsStarFill color="#4e4376" fontSize="1.5em"/> :
                        <BsStar color="#4e4376" fontSize="1.5em"/>
                    }
                        </Button>
                    </OverlayTrigger>
                )
            },
            {
                title: 'Blacklist',
                prop: "button",
                cell: (row) => (
                    <OverlayTrigger
                        placement="top"
                        overlay={(props) => (
                            <Tooltip {...props}>Add to blacklist</Tooltip>
                        )}
                    >
                        <Button className="py-0 my-0 transparent"
                            onClick={event => this.handleActionClick(event, 'del', row.poolId)}
                        >
                    {
                        (this.state.checked[row.poolId] && this.state.checked[row.poolId]['del']) ?
                        <BsXCircleFill color="#4e4376" fontSize="1.5em"/> :
                        <BsXCircle color="#4e4376" fontSize="1.5em"/>
                    }
                        </Button>
                    </OverlayTrigger>
                )
            }
        ];

        // Body of the table, depending of selected tab
        const body = this.state[this.state.tabSelected];
        
        return (
            <Container fluid className="MainTable">
                
                <Tabs
                    id="controlled-tab-example"
                    activeKey={this.state.tabSelected}
                    onSelect={(tabSelected) => this.setState({ tabSelected })}
                    className="nav-pills mt-5 mb-4"
                    >
                    <Tab eventKey="allPools" title="All pools"></Tab>
                    <Tab eventKey="whitelisted" title="Whitelisted pools"></Tab>
                    <Tab eventKey="blacklisted" title="Blacklisted pools"></Tab>
                </Tabs>

                
                
                <DatatableWrapper 
                    body={body} 
                    headers={headers}
                    paginationOptionsProps={{
                        initialState: {
                          rowsPerPage: 10,
                          options: [10, 50, 100]
                        }
                    }}
                    sortProps={{
                        sortValueObject: {
                            monthlyAPR: (column) => parseInt(column)
                        }
                    }}
                >
                    <Row className="mb-4">
                        <Col
                        xs={12}
                        lg={4}
                        className="d-flex flex-col justify-content-end align-items-end custom-color"
                        >
                        <Filter />
                        </Col>
                        <Col
                        xs={12}
                        sm={6}
                        lg={4}
                        className="d-flex flex-col justify-content-lg-center align-items-center justify-content-sm-start mb-2 mb-sm-0"
                        >
                        <PaginationOptions />
                        </Col>
                        <Col
                        xs={12}
                        sm={6}
                        lg={4}
                        className="d-flex flex-col justify-content-end align-items-end custom-color"
                        >
                        <Pagination />
                        </Col>
                    </Row>
                    
                    <Table striped hover>
                        <TableHeader />
                        {
                            !this.state.loading && 
                            <TableBody />
                        }
                    </Table>
                    {
                        this.state.loading &&
                        <Container fluid className="text-center">
                            <p>Fetching pools... This could take a few minutes.</p>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </Container>
                    }
                </DatatableWrapper>
            </Container>
        );
    }
}

export default MainTable;