import React from "react";
import Modal from "react-modal";
import { Col, Row, Button, ListGroup } from "react-bootstrap";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    width: "40%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

class AddContactModal extends React.Component {
  render() {
    Modal.setAppElement("#root");

    return (
      <Modal
        isOpen={this.props.showModal}
        contentLabel="Add Contact"
        style={customStyles}
      >
        <h4>Add Contact</h4>
        <hr />
        <ListGroup>
          {this.props.people &&
            this.props.people.map(
              ({ displayName, photoURL, email, publicKey }) =>
                (
                  <ListGroup.Item
                    key={email}
                    onClick={() => this.props.addFriend(email, publicKey)}
                  >
                    <Row>
                      <Col>
                        <img
                          src={photoURL}
                          alt="Profile"
                          style={{
                            width: "32px",
                            height: "auto"
                          }}
                        />
                      </Col>
                      <Col>{displayName}</Col>
                      <Col>{email}</Col>
                    </Row>
                  </ListGroup.Item>
                )
            )}
        </ListGroup>
        <hr />
        <Button onClick={this.props.handleCloseModal}>close</Button>
      </Modal>
    );
  }
}

export default AddContactModal;
