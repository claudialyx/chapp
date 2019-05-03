import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator
} from "react-native";
import { Image } from "react-native-elements";
import { ImagePicker } from "expo";
import firebase from "firebase";
import { storage } from "../Fire";
import uuid from "react-native-uuid";

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
    if (!result.cancelled) {
      this.setState({ imageUrl: result.uri });
    }
  };

  uploadImage = async () => {
    try {
      this.setState({ uploading: true });
      uploadUrl = await uploadImageAsync(this.state.imageUrl);
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

      // const ref = storage.ref().child('')
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
    let { name, imageUrl, uploadUrl, uploading } = this.state;
    // if (failed) return placeholderImg;
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
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            PlaceholderContent={<ActivityIndicator />}
          />
        ) : uploadUrl ? (
          <Image
            source={{
              uri: uploadUrl
            }}
            style={styles.image}
            PlaceholderContent={<ActivityIndicator />}
          />
        ) : (
          <Image
            // source={{ uri: "https://via.placeholder.com/150"}}
            source={require("../assets/icons8-compact-camera-50.png")}
            style={styles.imagePlaceholder}
          />
        )}
        <TouchableOpacity style={styles.button}>
          <Button title="Upload Image" onPress={this.uploadImage} />
        </TouchableOpacity>
        {/* {uploadUrl ? (
          <Image
            source={{
              uri: uploadUrl
            }}
            style={styles.image}
            PlaceholderContent={<ActivityIndicator />}
          />
        ) : null} */}
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
    width: 150,
    height: 150,
    borderRadius: 150,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 150,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain"
  }
});
export default Main;
