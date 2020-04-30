import React from "react";
import * as firebase from "firebase";
import aesjs from "aes-js";
import { Crypt } from "hybrid-crypto-js";

import { Button, Col, Row, ListGroup } from "react-bootstrap";

class PostBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      posts: [],
      collection: firebase.firestore().collection("posts"),
      db: firebase.firestore()
    };
  }

  postMessage = event => {
    event.preventDefault();
    var aesCtr = new aesjs.ModeOfOperation.ctr(this.props.postKey);
    var postBytes = aesjs.utils.utf8.toBytes(this.state.value);
    var encryptedPost = aesCtr.encrypt(postBytes);

    let post = {
      timestamp: Date.now(),
      content: firebase.firestore.Blob.fromUint8Array(encryptedPost),
      poster: {
        name: this.props.userName,
        email: this.props.email,
        profilePic: this.props.userPhoto
      }
    };

    this.state.db
      .collection("posts")
      .doc()
      .set(post);
  };

  handleChange = event => {
    this.setState({ value: event.target.value });
  };

  componentDidMount() {
    this.listenForPosts();
  }

  async componentDidUpdate() {
    await this.listenForPosts();
  }

  async listenForPosts() {
    let self = this;
    let crypt = new Crypt();

    const snapshot = await firebase
      .firestore()
      .collection("posts")
      .get();
    let data = snapshot.docs.map(doc => {
      let docCon = doc.data()
      let friendPostKey = null;
      self.props.friends.forEach(friend => {
        if (friend.email === docCon.poster.email) {
          friendPostKey = crypt
            .decrypt(self.props.userPrivateKey, friend.postKey)
            .message.split(",")
            .map(val => {
              return parseInt(val);
            });

          var aesCtr = new aesjs.ModeOfOperation.ctr(friendPostKey);
          var decryptedBytes = aesCtr.decrypt(docCon.content.toUint8Array());
          var post = aesjs.utils.utf8.fromBytes(decryptedBytes);
          docCon.content = post;
        }
        else if (docCon.poster.email !== self.props.email){
          var encrypted = docCon.content.toUint8Array();
          var toText = new TextDecoder('utf-8').decode(encrypted);
          docCon.content = "Encrypted: " + toText;
        }
      });

      if (docCon.poster.email === self.props.email) {
        var aesCtr = new aesjs.ModeOfOperation.ctr(self.props.postKey);
        var decryptedBytes = aesCtr.decrypt(docCon.content.toUint8Array());
        var post = aesjs.utils.utf8.fromBytes(decryptedBytes);

        docCon.content = post;
      }

      return docCon
    });

    this.setState({ posts: data });

    /*
    this.state.collection.onSnapshot(
      collSnap => {
        let data = collSnap.docs;
        data.forEach(doc => doc.data());
        if (data.length !== self.state.posts.length) {
          data.forEach(async function(doc) {
            getMarker();
            /*
            self.state.collection
              .doc(doc.id)
              .get()
              .then(res => res.data())
              .then(docCon => {
                let friendPostKey = null;
                self.props.friends.forEach(friend => {
                  if (friend.email === docCon.poster.email) {
                    friendPostKey = crypt
                      .decrypt(self.props.userPrivateKey, friend.postKey)
                      .message.split(",")
                      .map(val => {
                        return parseInt(val);
                      });

                    var aesCtr = new aesjs.ModeOfOperation.ctr(friendPostKey);
                    var decryptedBytes = aesCtr.decrypt(
                      docCon.content.toUint8Array()
                    );
                    var post = aesjs.utils.utf8.fromBytes(decryptedBytes);
                    docCon.content = post;
                  }
                });

                if (docCon.poster.email === self.props.email) {
                  var aesCtr = new aesjs.ModeOfOperation.ctr(
                    self.props.postKey
                  );
                  var decryptedBytes = aesCtr.decrypt(
                    docCon.content.toUint8Array()
                  );
                  var post = aesjs.utils.utf8.fromBytes(decryptedBytes);

                  docCon.content = post;
                }

                var contains = false;
                for (post in posts) {
                  if (post.timestamp === docCon.timestamp) {
                    contains = true;
                  }
                }

                if (!contains) posts.push(docCon);

                if (posts.length === data.length) {
                  self.setState({ posts: posts });
                }
              });
          });
        }
      },
      err => {
        console.log(`Encountered error: ${err}`);
      }
    );
    */
  }

  render() {
    const { value, posts } = this.state;

    return (
      <div>
        <form
          className="form-inline d-none d-sm-inline-block mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
          style={{ width: "95%" }}
          onSubmit={this.postMessage}
        >
          <div className="input-group">
            <input
              id="username"
              type="text"
              className="bg-light form-control border-0 small"
              placeholder="New Post..."
              value={value}
              onChange={this.handleChange}
            />
            <div className="input-group-append">
              <Button
                className="btn btn-primary py-0"
                type="submit"
                value="Send"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </form>
        <ListGroup>
          {posts &&
            posts.map((post, index) => (
              <ListGroup.Item key={index}>
                <Row>
                  <Col sm style={{ margin: "0px" }}>
                    <img
                      src={post.poster.profilePic}
                      style={{ width: "24px", height: "auto" }}
                      alt="Profile"
                    />
                  </Col>
                  <Col xs={10}>{post.content}</Col>
                </Row>
              </ListGroup.Item>
            ))}
        </ListGroup>
      </div>
    );
  }
}

export default PostBoard;
