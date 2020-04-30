import logo from "../assets/img/logo.png";

import React from "react";
import { Redirect } from "react-router-dom";
import * as firebase from "firebase";
import aesjs from "aes-js";

import { Container, Row, Col, Card } from "react-bootstrap";
import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { Crypt, RSA } from "hybrid-crypto-js";
import { init } from "../components/FirebaseInitialiser";

class Login extends React.Component {
  constructor(props) {
    super(props);

    require("dotenv").config({ debug: true });

    this.state = {
      loggedIn: false,
      friends: [],
      userUid: null,
      userName: null,
      userPhoto: null,
      userEmail: null,
      userToken: null
    };

    init();
  }

  loadProfile = async creds => {
    console.log(creds);

    let key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    for (let i = 0; i < key.length; i++) {
      key[i] = creds.user.uid.charCodeAt(i);
    }

    var crypt = new Crypt();
    var self = this;
    var db = firebase.firestore();

    let userDoc = db.collection("users").doc(creds.user.email);
    userDoc
      .get()
      .then(doc => {
        if (!doc.exists) {
          var rsa = new RSA();

          let publicKey;
          let privateKey;

          rsa.generateKeyPairAsync().then(keyPair => {
            publicKey = keyPair.publicKey;
            privateKey = keyPair.privateKey;
          }).then(() => {
            var aesCtr = new aesjs.ModeOfOperation.ctr(key);
            var privBytes = aesjs.utils.utf8.toBytes(privateKey);
            var encryptedPriv = aesCtr.encrypt(privBytes);

            var postKey = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
            var encryptedPostKey = crypt.encrypt(publicKey, postKey);

            let data = {
              displayName: creds.user.displayName,
              photoURL: creds.user.photoURL,
              email: creds.user.email,
              publicKey: publicKey,
              privateKey: firebase.firestore.Blob.fromUint8Array(encryptedPriv),
              postKey : encryptedPostKey,
              friends: [],
              requested: []
            };

            db.collection("users")
            .doc(creds.user.email)
            .set(data)
            .then(() =>
              self.setState({
                loggedIn: true,
                userUid: creds.user.uid,
                userName: creds.user.displayName,
                userPhoto: creds.user.photoURL,
                userEmail: creds.user.email,
                userToken: creds.credential.idToken,
                userPublicKey: publicKey,
                userPrivateKey: privateKey,
                postKey: postKey,
                friends: [],
                requested: []
              })
            );
          })
        } else {
          var aesCtr = new aesjs.ModeOfOperation.ctr(key);
          var decryptedBytes = aesCtr.decrypt(doc.data().privateKey.toUint8Array());
          var privateKey = aesjs.utils.utf8.fromBytes(decryptedBytes)

          var decryptedPostKey = crypt.decrypt(privateKey, doc.data().postKey).message.split(",").map(val => { return parseInt(val) })

          self.setState({
            loggedIn: true,
            userUid: creds.user.uid,
            userName: creds.user.displayName,
            userPhoto: creds.user.photoURL,
            userEmail: creds.user.email,
            userToken: creds.credential.idToken,
            userPublicKey: doc.data().publicKey,
            userPrivateKey: privateKey,
            postKey: decryptedPostKey,
            friends: doc.data().friends,
            requested: doc.data().requested
          });
        }
      })
      .catch(err => {
        console.log("Error getting document", err);
      });
  };

  responseGoogle = response => {
    console.log(response);
    var credential = firebase.auth.GoogleAuthProvider.credential(
      response.tc.id_token
    );

    var self = this;

    firebase
      .auth()
      .signInWithCredential(credential)
      .then( creds => self.loadProfile(creds))
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        console.log("Error " + errorCode + ": " + errorMessage);
        console.log("Email: " + email);
        console.log("Credential: " + credential);
      });
  };

  responseFacebook = response => {
    console.log(response);

    var credential = firebase.auth.FacebookAuthProvider.credential(
      response.accessToken
    );

    var self = this;

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(creds => self.loadProfile(creds))
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        console.log("Error " + errorCode + ": " + errorMessage);
        console.log("Email: " + email);
        console.log("Credential: " + credential);
      });
  };

  render() {
    const {
      loggedIn,
      userUid,
      userName,
      userPhoto,
      userEmail,
      userToken,
      userPublicKey,
      userPrivateKey,
      friends,
      requested,
      postKey
    } = this.state;

    return (
      <div className="App">
        {loggedIn && (
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
                friends: friends,
                requested: requested
              }
            }}
          />
        )}

        <Container>
          <Row className="justify-content-center">
            <Col className="col-md-9 col-lg-12 col-xl-10 justify-content-center">
              <Card className="shadow-lg o-hidden border-0 my-5 justify-content-center">
                <Card.Body className="p-0 justify-content-center">
                  <Row className="justify-content-center">
                    <Col className="col-lg-6 justify-content-center">
                      <div className="p-5 justify-content-center">
                        <div className="text-center justify-content-center">
                          <h4 className="text-dark mb-4">Secure Social</h4>
                        </div>
                        <GoogleLogin
                          clientId="229758778420-kfodakij699oncpbvaoppge2hj56oe6f.apps.googleusercontent.com"
                          render={renderProps => (
                            <button
                              onClick={renderProps.onClick}
                              disabled={renderProps.disabled}
                              className="btn btn-primary btn-block text-white btn-google btn-user"
                            >
                              <i className="fab fa-google"></i>&nbsp; Login with
                              Google
                            </button>
                          )}
                          onSuccess={this.responseGoogle}
                          onFailure={this.responseGoogle}
                          cookiePolicy={"single_host_origin"}
                        />
                        <FacebookLogin
                          appId="649543218885961"
                          autoLoad={false}
                          cssClass="btn btn-primary btn-block text-white btn-facebook btn-user"
                          icon="fa-facebook"
                          style={{ textSpacing: "10px" }}
                          callback={this.responseFacebook}
                        />
                      </div>
                    </Col>
                    <Col className="col-lg-6 justify-content-center">
                      <img
                        src={logo}
                        alt="logo"
                        style={{
                          backgroundColor: "transparent",
                          paddingTop: "5vh",
                          height: "30vh"
                        }}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
