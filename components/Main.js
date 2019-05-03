import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button
} from "react-native";
import { ImagePicker } from "expo";
import firebase from "firebase";
import { storage } from "../Fire";

let imageBase64 = "";

class Main extends React.Component {
  state = {
    name: "",
    imageUrl: "",
    uploadUrl: "",
    uploading: false,
    image: ""
  };

  onChangeText = name => this.setState({ name });

  onPress = () => {
    // navigate by using this.props.navigation which is provided at the screen level by our stack navigator.
    // navigation has a method called navigate which will push a new screen,
    // we will pass in the name of the screen we defined earlier in the App.js — Chat and then
    // we will pass some props to that screen, specifically the state.name we created with the TextInput.
    this.props.navigation.navigate("Chat", { name: this.state.name });
  };

  //launch image picker, then store the image uri into state
  //launchImageLibraryAsync is an expo thing
  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });
    console.log("image:", result);
    // this.handleImagePicked(result)
    if (!result.cancelled) {
      //   // imageBase64 = result.base64;
      this.setState({ imageUrl: result.uri });
    }
  };

  uploadImage = async imageuri => {
    try {
      this.setState({ uploading: true });
      uploadUrl = await uploadImageAsync(imageuri);
      this.setState({ uploadUrl });
    } catch (e) {
      console.log("Error uploading image:", e);
      alert("Upload failed, please try again");
    } finally {
      this.setState({ uploading: false });
    }

    async function uploadImageAsync(uri) {
      // Why are we using XMLHttpRequest? See:
      // https://github.com/expo/expo/issues/2402#issuecomment-443726662
      // The resolve and reject functions, when called, resolve or reject the promise, respectively.
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response); //when BlobModule finishes reading, resolve with the blob
        };
        xhr.onerror = function(e) {
          console.log(e);
          reject(new TypeError("Network request failed")); // error occurred, rejecting
        };
        xhr.responseType = "blob"; // use BlobModule's UriHandler
        xhr.open("GET", uri, true); // fetch the blob from uri in async mode
        xhr.send(null); // no initial data
      });

      const ref = storage.ref().child(uuid.v4());
      const snapshot = await ref.put(blob);

      // In order not to leak blobs, we should also call blob.close() when we're done sending it.
      blob.close();
      downloadUri = snapshot.ref.getDownloadURL();
      console.log(await downloadUri);
      return await downloadUri;
    }
  };

  render() {
    let { name, imageUrl, uploadUrl } = this.state;
    return (
      <View>
        {/* <Text>Hello</Text> */}
        <Text style={styles.title}>Choose a profile picture</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.button} onPress={this.pickImage}>
            Pick an image from camera roll
          </Text>
        </TouchableOpacity>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : null}
        <TouchableOpacity style={styles.button}>
          <Button title="Upload Image" onPress={this.uploadImage} />
        </TouchableOpacity>
        {uploadUrl ? null : (
          <Image
            source={{
              uri: uploadUrl
            }}
            style={{ width: 200, height: 200 }}
          />
        )}
        <Text style={styles.title}>Enter your name:</Text>
        <TextInput
          onChangeText={this.onChangeText}
          style={styles.nameInput}
          placeholder="John Cena"
          value={name}
        />
        <TouchableOpacity onPress={this.onPress}>
          <Text style={styles.text}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const offset = 24;
const styles = StyleSheet.create({
  nameInput: {
    height: offset * 2,
    margin: offset,
    paddingHorizontal: offset,
    borderColor: "#111111",
    borderWidth: 1,
    color: "#444",
    fontSize: 16
  },
  title: {
    marginTop: offset,
    marginLeft: offset,
    fontSize: offset
  },
  text: {
    marginLeft: offset,
    fontSize: offset
  },
  button: {
    height: 50,
    borderRadius: 50,
    fontSize: 16,
    color: "blue",
    paddingHorizontal: offset
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
});
export default Main;

// //upload the image uri into firebase storage
// uploadImage = () => {
//   const { imageUrl } = this.state;
//   console.log(imageUrl);
//   // Create a reference to a location in our database where the images will be saved, in our case it’s /images
//   // put() takes files via the JavaScript File and Blob APIs and uploads them to Cloud Storage.
//   // put() and putString() return an UploadTask which can be used as a promise/use to manage & monitor upload status.
//   const uploadTask = storage.ref(`images/${imageUrl}`).putString(imageBase64);
//   // const uploadTask = storage.ref(`images/${imageUrl}`).put(imageUrl); //Firebase Storage: Invalid argument in `put` at index 0: Expected Blob or File.

//   // Register three observers:
//   // 1. 'state_changed' observer, called any time the state changes
//   // 2. Error observer, called on failure
//   // 3. Completion observer, called on successful completion
//   uploadTask.on(
//     "state_changed",
//     snapshot => {
//       // Observe state change events such as progress, pause, and resume
//       // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//       var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//       console.log("Upload is " + progress + "% done");
//       switch (snapshot.state) {
//         case firebase.storage.TaskState.PAUSED: // or 'paused'
//           console.log("Upload is paused");
//           break;
//         case firebase.storage.TaskState.RUNNING: // or 'running'
//           console.log("Upload is running");
//           break;
//       }
//     },
//     //error observer
//     error => {
//       // Handle unsuccessful uploads
//       console.log("upload error:", error);
//     },
//     //completion observer
//     () => {
//       // Handle successful uploads on complete
//       // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//       uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
//         console.log("File available at", downloadURL);
//         this.setState({ downloadUrl: downloadURL });
//       });
//     }
//   );
// };
