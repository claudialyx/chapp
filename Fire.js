import firebase from "firebase";

class Fire {
  constructor() {
    this.init();
    this.observeAuth(); //after initializing, we call our observeAuth function
  }

  //access firebase using initializeApp
  init = () =>
    firebase.initializeApp({
      apiKey: "AIzaSyACwGmwukK374b-PpY1iommXzpOWNSJ1j0",
      authDomain: "mobile-chat-app-ac76e.firebaseapp.com",
      databaseURL: "https://mobile-chat-app-ac76e.firebaseio.com",
      projectId: "mobile-chat-app-ac76e",
      storageBucket: "mobile-chat-app-ac76e.appspot.com",
      messagingSenderId: "295358577947"
    });

  //This onAuthStateChanged gets called whenever the user's sign-in state changes.
  // we want to get our auth, if we were signed in before then this will return a user,
  // if we weren’t then this will be null.
  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    console.log('oauthstatechanged:',user)
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        console.log("error message:", message);
        alert(message);
      }
    }
  };

  // Create a reference to a location in our database where the messages will be saved, in our case it’s /messages
  get ref() {
    return firebase.database().ref("messages");
  }
  // Make a method with a callback prop that calls our messages ref and get’s the last 20 messages,
  // then whenever a new message comes in we will get that as well.
  // When we get a message we want to send it a function to parse.
  on = callback =>
    this.ref
      .limitToLast(20)
      .on("child_added", snapshot => callback(this.parse(snapshot))); //querying

  // reduce (change the shape) of the snapshot (data returned from firebase) in the parse method for GiftedChat use
  parse = snapshot => {
    //calling snapshot.val() will return the value or object associated with the snapshot
    const { timestamp: numberStamp, text, user } = snapshot.val(); //destructuring
    console.log("snapshot", snapshot.val());
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp); // convert timestamp that was saved into a js Date.
    //create an object that GiftedChat is familiar with, then return it, _id is the unique key for the message
    const message = {
      _id,
      createdAt:timestamp,
      text,
      user,
    };
    return message;
  };

  //function to unsubscribe to the database (it's a firebase thing)
  //can remove a single listener by passing it as a parameter to off().
  //Calling off() on the location with no arguments removes all listeners at that location.
  //Calling off() on a parent listener does not automatically remove listeners registered on its child nodes;
  //off() must also be called on any child listeners to remove the callback.
  off() {
    this.ref.off();
  }

  // to send messages:
  // to get user's uid
  get uid() {
    console.log('uid:', firebase.auth().currentUser )
    return (firebase.auth().currentUser || {}).uid;
  }

  get timestamp() {
    console.log("firebase.database:", firebase.database);
    return firebase.database.ServerValue.TIMESTAMP;
  }

  send = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      console.log("here", messages[i]);
      console.log("user", user);
      const message = {
        text,
        user,
        timestamp: this.timestamp
      };
      this.append(message);
    }
  };

  //The append function will save the message object with a unique ID
  append = message => this.ref.push(message);
}

Fire.shared = new Fire();
const storage = firebase.storage();
// export default Fire;
export {Fire, storage};
