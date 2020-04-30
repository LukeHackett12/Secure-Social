import React from 'react';
import { Redirect } from "react-router-dom";
import * as firebase from "firebase";
import { Container, Col, Row, Button, Dropdown} from "react-bootstrap";
import { Crypt } from "hybrid-crypto-js";

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href="/"
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </a>
));

class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = this.props.state;
  }

  componentDidMount(){
    this.listenForFriendRequests();
  }

  componentDidUpdate() {
    this.listenForFriendRequests();
  }

  listenForFriendRequests() {
    let db = firebase.firestore();
    let doc = db.collection("users").doc(this.state.userEmail);

    doc.onSnapshot(
      docSnap => {
        let data = docSnap.data();
        this.setState({ requested: data.requested, friends: data.friends});
      },
      err => {
        console.log(`Encountered error: ${err}`);
      }
    );
  }

  acceptFriend = (email, name, postKey, profilePic, publicKey) => {
    let db = firebase.firestore();
    let doc = db.collection("users").doc(this.state.userEmail);

    let crypt = new Crypt()
    postKey = crypt.decrypt(this.state.userPrivateKey, postKey).message.split(",").map(val => { return parseInt(val)})

    doc.get()
    .then(res => res.data())
    .then(data => { 
      let tempRequested = data.requested.filter(function( obj ) {
        return obj.email !== email;
      });
      data.requested = tempRequested
      return data
    })
    .then(data => {
      data.friends.push({email: email, 
                        name: name, 
                        profilePic: profilePic, 
                        postKey: crypt.encrypt(this.state.userPublicKey, postKey),
                      })
      return data
    })
    .then(data => doc.set(data))

    let friendDoc = db.collection("users").doc(email)
    friendDoc.get()
    .then(res => res.data())
    .then(data => {
      data.friends.push({email: this.state.userEmail,
                          name: this.state.userName,
                          profilePic: this.state.userPhoto,
                          postKey: crypt.encrypt(publicKey, this.state.postKey)})
      return data
    })
    .then(data => friendDoc.set(data))
  }

  declineFriend = email => {
    let db = firebase.firestore();
    let doc = db.collection("users").where("email", "==", email);
    doc.get()
    .then(res => res.data())
    .then(data => { 
      let tempRequested = data.requested.filter(function( obj ) {
        return obj.email !== email;
      });

      data.requested = tempRequested
      return data
    })
    .then(data => doc.set(data))
  }

  render(){
    const {
      requested,
      loadContacts, 
      loadProfile,
      userEmail,
      userName,
      userPhoto,
      userToken,
      userPublicKey,
      userPrivateKey,
      postKey,
      userUid,
      friends
      } = this.state

    return(
      <div>
      {loadProfile && (
        <Redirect
          to={{
            pathname: "/profile",
            state: {
              userUid: userUid,
              userName: userName,
              userPhoto: userPhoto,
              userEmail: userEmail,
              userToken: userToken,
              userPublicKey: userPublicKey,
              userPrivateKey: userPrivateKey,
              postKey: postKey,
              friends: friends
            }
          }}
        />
      )}

      {loadContacts && (
        <Redirect
          to={{
            pathname: "/contacts",
            state: {
              userUid: userUid,
              userName: userName,
              userPhoto: userPhoto,
              userEmail: userEmail,
              userToken: userToken,
              userPublicKey: userPublicKey,
              userPrivateKey: userPrivateKey,
              postKey: postKey,
              friends: friends,
              requested: requested
            }
          }}
        />
      )}
    <nav className="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0">
          <Container
            fluid={true}
            className="container-fluid d-flex flex-column p-0"
          >
            <div className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0">
              <div className="sidebar-brand-icon rotate-n-15">
                <i className="fas fa-laugh-wink"></i>
              </div>
              <div className="sidebar-brand-text mx-3">
                <span>Secure Social</span>
              </div>
            </div>
            <hr className="sidebar-divider my-0" />
            <ul className="nav navbar-nav text-light" id="accordionSidebar">
              <li className="nav-item" role="presentation">
                <div className="nav-link"
                  onClick={() => this.setState({ loadProfile: true, loadContacts: false })}
                >
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </div>
              </li>
              <li className="nav-item" role="presentation">
                <div
                  className="nav-link"
                  onClick={() => this.setState({ loadContacts: true, loadProfile: false })}
                >
                  <i className="fas fa-user-lock"></i>
                  <span>Contacts</span>
                </div>
              </li>
              <li>
                <Dropdown style={{ paddingLeft: "8%" }}>
                  <Dropdown.Toggle as={CustomToggle} id="dropdown-basic">
                    <i
                      style={{ color: "white", paddingTop: "10%" }}
                      className="fas fa-user-friends"
                    ></i>
                    <span className="badge badge-danger badge-counter">
                      {requested ? requested.length : 0}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu >
                    {requested &&
                      requested.map(({ email, name, postKey, profilePic, publicKey }) => (
                        <div key={email}>
                          <Container fluid={true} style={{}}>
                          <Row xs={4} md={6} lg={8}>
                            <Col sm>
                              <img style={{width: "20px", height: "auto"}} src={profilePic} alt="Profile" />
                            </Col>
                            <Col sm>
                              {name}
                            </Col>
                            <Col sm className="m-0 p-0">
                              <Button style={{width: "20px", height: "20px", padding:"0"}} className="fas fa-plus" onClick={()=> this.acceptFriend(email, name, postKey, profilePic, publicKey)}/>
                            </Col>
                            <Col sm className="m-0 p-0">
                              <Button style={{width: "20px", height: "20px", padding:"0"}} className="fas fa-times" onClick={()=> this.declineFriend(email)}/>
                            </Col>
                          </Row>
                          </Container>
                          <hr/>
                        </div>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
            <div className="text-center d-none d-md-inline"></div>
          </Container>
        </nav>
        </div>
    )}
}

export default Sidebar;
