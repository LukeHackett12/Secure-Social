import * as firebase from "firebase";

export function init() {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: process.env.REACT_APP_firebase_api_key,
        authDomain: "crest-f8474.firebaseapp.com",
        databaseURL: "https://crest-f8474.firebaseio.com",
        projectId: "crest-f8474",
        storageBucket: "crest-f8474.appspot.com",
        messagingSenderId: "229758778420",
        appId: "1:229758778420:web:3c4cfcf53a4634a13d1e61",
        measurementId: "G-DC2XXBEFJK"
      });
    }
  }