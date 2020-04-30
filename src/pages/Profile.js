import React from "react";
import { Container, Col, Row, Card } from "react-bootstrap";

import Sidebar from '../components/Sidebar'
import PostBoard from '../components/PostBoard'
import { init } from "../components/FirebaseInitialiser";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.location.state;

    init();
  }

  render() {
    const {
      userEmail,
      userName,
      userPhoto,
      friends,
      postKey,
      userPrivateKey
    } = this.state;

    return (
      <div id="wrapper">
        <Sidebar state={this.state}/>
        <Col className="d-flex flex-column">
          <Container fluid={true}>
            <Row className="row mb-3">
              <Col className="col-lg-4">
                <Card className="card mb-3">
                  <Card.Body className="text-center shadow">
                    <img
                      className="rounded-circle mb-3 mt-4"
                      src={userPhoto}
                      alt="Profile"
                      width="160"
                      height="160"
                    />
                  </Card.Body>
                </Card>
                <Card className="card shadow mb-4">
                  <Card.Header className="card-header py3">
                    <h6 className="text-primary font-weight-bold m-0">
                      Profile Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>Name: {userName}</Row>
                    <Row>Email Address: {userEmail}</Row>
                    <Row>Friends: {friends.length}</Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="col-lg-8">
                <Row className="row">
                  <Col className="col">
                    <Card className="card shadow mb-3">
                      <Card.Header>Post Board</Card.Header>
                      <PostBoard userName={userName} userPhoto={userPhoto} friends={friends} postKey={postKey} userPrivateKey={userPrivateKey} email={userEmail}/>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </Col>
      </div>
    );
  }
}

export default Profile;
