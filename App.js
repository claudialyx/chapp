import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Import the screens
import Main from "./components/Main";
import Chat from "./components/Chat";

// Import React Navigation
import { createStackNavigator, createAppContainer } from "react-navigation";

// Create the navigator
const navigator = createStackNavigator({
  Main,
  Chat
});

// const navigator = createStackNavigator({
//   Main: { screen: Main },
//   Chat: { screen: Chat }
// });

// Export it as the root component
// App container is the main container for React to render
const App = createAppContainer(navigator);

export default App;
