import React from "react";
import * as firebase from "firebase";
import { Container, Col, Row, Card, Button } from "react-bootstrap";
import { Crypt } from 'hybrid-crypto-js';

import Sidebar from "../components/Sidebar";
import ContactsList from "../components/ContactsList";
import AddContactModal from "../components/AddContactModal";
import { init } from "../components/FirebaseInitialiser";

class Contacts extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.location.state;

    this.handleCloseModal = this.handleCloseModal.bind(this);
    init();
  }

  componentDidMount() {
    this.setState({ showModal: false});
  }

  componentDidUpdate() {
    let people = [];
    let contacts = this;
    var db = firebase.firestore();

    db.collection("users")
      .get()
      .then(res => {
        res.docs.forEach((doc, index) => {
          let fDoc = db
            .collection("users")
            .doc(doc.id)
            .get()
            .then(per => {
              if (per.id !== this.state.userEmail) {
                people.push({displayName: per.data().displayName, photoUrl: per.data().photoURL, email: per.id, publicKey: per.data().publicKey});
              }

              if(index === res.docs.length-1) {
                contacts.setState({people: people})
              }
            })
          return fDoc;
        });
      })
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  addFriend = (userEmail, publicKey) => {
    //Add friend to user, state: pending
    let crypt = new Crypt();

    var db = firebase.firestore();
    db.collection("users")
      .doc(userEmail)
      .get()
      .then(res => {console.log(res); return res})
      .then(res => res.data())
      .then(doc => {
        console.log(doc);
        let req = doc.requested;
        req.push({
          email: this.state.userEmail,
          name: this.state.userName,
          profilePic: this.state.userPhoto,
          publicKey: this.state.userPublicKey,
          postKey: crypt.encrypt(publicKey, this.state.postKey)
        });

        doc.requested = req;
        db.collection("users")
        .doc(userEmail)
        .set(doc);
      });
  };

  render() {
    const { friends, people, showModal } = this.state;

    return (
      <div id="wrapper">
        <Sidebar state={this.state} />
        <Col className="d-flex flex-column">
          <Container fluid={true}>
            <h3 className="text-dark mb-4">Contacts</h3>
            <Row className="row mb-3">
              <Col className="col">
                <Row className="row">
                  <Col className="col">
                    <Card className="card shadow">
                      <Card.Header>
                        <Row>
                          <Col
                            style={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              marginBottom: 0
                            }}
                          >
                            <h5 className="text-dark mt-2">Contacts</h5>
                          </Col>
                          <Col className="justify-content-right pull-right">
                            <Button
                              className="btn-primary pull-right float-right"
                              onClick={() => this.setState({ showModal: true })}
                            >
                              Add Contact
                            </Button>
                            <AddContactModal
                              people={people}
                              showModal={showModal}
                              handleCloseModal={this.handleCloseModal}
                              addFriend={this.addFriend}
                            />
                          </Col>
                        </Row>
                      </Card.Header>
                      <Card.Body>
                        <Container>
                          <ContactsList friends={friends} />
                        </Container>
                      </Card.Body>
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

export default Contacts;
