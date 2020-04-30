import React from "react";

import { Col, Row, ListGroup } from "react-bootstrap";

class ContactsList extends React.Component {
  render() {
    return (
      <ListGroup>
        {this.props.friends &&
          this.props.friends.map(({ userEmail, name, profilePic }) => (
            <ListGroup.Item key={userEmail}>
              <Row>
                <Col>
                  <img
                    src={profilePic}
                    alt="Profile"
                    style={{
                      width: "64px",
                      height: "auto"
                    }}
                  />
                </Col>
                <Col>{name}</Col>
                <Col>{userEmail}</Col>
              </Row>
            </ListGroup.Item>
          ))}
      </ListGroup>
    );
  }
}

export default ContactsList;