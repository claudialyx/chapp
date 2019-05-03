import React from "react";
import { View, StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { Fire } from "../Fire";

class Chat extends React.Component {
  state = {
    messages: []
  };

  // When the component is added to the screen, we want to start looking for messages.
  // Call the Fire.shared.on method and pass in a callback. We want our callback to get messages
  // then add them to our current messages.
  componentDidMount() {
    Fire.shared.on(message =>
      this.setState(prevState => ({
        messages: GiftedChat.append(prevState.messages, message)
      }))
    );
  }

  //when the component leaves the screen we want to unsubscribe from the database.
  componentWillUnmount() {
    Fire.shared.off();
  }

  // navigationOptions is used to configure how the navigation components (Header) look and act.
  // We are passing an object with a title property that will set the title to either the state.params.name
  // or a default value of Chat!
  //{navigation} = destructuring
  static navigationOptions = ({ navigation }) => (
    {
      title: (navigation.state.params || {}).name || "Chat!"
    },
    console.log(navigation)
  );

  getUser() {
    // Return our name and our UID for GiftedChat to parse
    return {
      name: this.props.navigation.state.params.name,
      _id: Fire.shared.uid
    };
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={Fire.shared.send}
        user={this.getUser()}
      />
    );
  }
}

export default Chat;
