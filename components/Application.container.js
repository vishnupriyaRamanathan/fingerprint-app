import React, { Component } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import FingerprintScanner from "react-native-fingerprint-scanner";

import styles from "./Application.container.styles";
import FingerprintPopup from "./FingerprintPopup.component";
import axios from "axios";
import keys from "../helpers/apiKeys";
import {NotificationsAndroid, PendingNotifications} from 'react-native-notifications';


// On Android, we allow for only one (global) listener per each event type.
NotificationsAndroid.setRegistrationTokenUpdateListener((deviceToken) => {
	// TODO: Send the token to my server so it could send back push notifications...
	console.log('Push-notifications registered!', deviceToken)
});

NotificationsAndroid.setNotificationReceivedListener((notification) => {
	console.log("Notification received on device in background or foreground", notification.getData());
});
NotificationsAndroid.setNotificationReceivedInForegroundListener((notification) => {
	console.log("Notification received on device in foreground", notification.getData());
});
NotificationsAndroid.setNotificationOpenedListener((notification) => {
	console.log("Notification opened by device user", notification.getData());
});

PendingNotifications.getInitialNotification()
  .then((notification) => {
  		console.log("Initial notification was:", (notification ? notification.getData() : 'N/A'));
	})  	
  .catch((err) => console.error("getInitialNotifiation() failed", err));

class Application extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: undefined,
      popupShowed: false,
      fcm_token: ""
    };
  }

  handleFingerprintShowed = () => {
    console.log("hlooooo");
    this.setState({ popupShowed: true });
  };

  handleFingerprintDismissed = () => {
    this.setState({ popupShowed: false });
  };

  async componentDidMount() {
    await axios
      .get(
          `https://api.thingspeak.com/channels/716191/feeds.json?api_key=${keys.inputRead}`
      )
      .then(response => {
        console.log("response on mount", response.data.feeds);
        if (response.data.feeds) {
          console.log("inside feeds blockk!!!!!!");
          var length = response.data.feeds.length;
          console.log(
            "response.data.feeds[length - 1].field2",
            response.data.feeds[length - 1].field2
          );
          if (response.data.feeds[length - 1].field2 === "1") {
            console.log("intrusion intrusion");
            this.handleFingerprintShowed();
          } else {
            console.log("all good!!! no intrusion!!");
          }
        }
      });
    FingerprintScanner.isSensorAvailable().catch(error =>
      this.setState({ errorMessage: error.message })
    );
    
  } 

  render() {
    const { errorMessage, popupShowed } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Fingerprint Authentication</Text>
        <Text style={styles.subheading}>Security Locker</Text>

        <TouchableOpacity
          style={styles.fingerprint}
          onPress={this.handleFingerprintShowed}
          disabled={!!errorMessage}
        >
          <Image source={require("../assets/finger_print.png")} />
        </TouchableOpacity>

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {popupShowed && (
          <FingerprintPopup
            style={styles.popup}
            handlePopupDismissed={this.handleFingerprintDismissed}
          />
        )}
      </View>
    );
  }
}

export default Application;
