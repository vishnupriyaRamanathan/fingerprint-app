import React, { Component } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes
} from "react-native";
import FingerprintScanner from "react-native-fingerprint-scanner";
import PropTypes from "prop-types";
import ShakingText from "./ShakingText.component";
import styles from "./FingerprintPopup.component.styles";
import axios from "axios";
import keys from "../helpers/apiKeys";
class FingerprintPopup extends Component {
  constructor(props) {
    super(props);
    this.state = { errorMessage: undefined };
  }

  componentDidMount() {
    FingerprintScanner.authenticate({
      onAttempt: this.handleAuthenticationAttempted
    })
      .then(() => {
        this.props.handlePopupDismissed();
        Alert.alert("Fingerprint Authentication", "Authenticated successfully");
        axios
          .get(
            `https://api.thingspeak.com/update?api_key=${keys.outputWrite}&field1=0&field2=1`
          )
          .then(function(response) {
            console.log("verified!!!!!!!!!!!");
          });
      })
      .catch(error => {
        this.setState({ errorMessage: error.message });
        this.description.shake();
      });
  }

  componentWillUnmount() {
    FingerprintScanner.release();
  }

  handleAuthenticationAttempted = error => {
    console.log("errorrrrrrr", error);
    axios
      .get(
        `https://api.thingspeak.com/update?api_key=${keys.outputWrite}&field1=0&field2=0`
      )
      .then(function(response) {
        console.log("not verified!!!!!!!!!!!!!!");
      });
    this.setState({ errorMessage: error.message });
    this.description.shake();
  };

  render() {
    const { errorMessage } = this.state;
    const { style, handlePopupDismissed } = this.props;
    return (
      <View style={styles.container}>
        <View style={[styles.contentContainer, style]}>
          <Image
            style={styles.logo}
            source={require("../assets/finger_print.png")}
          />

          <Text style={styles.heading}>Fingerprint{"\n"}Authentication</Text>
          <ShakingText
            ref={instance => {
              this.description = instance;
            }}
            style={styles.description(!!errorMessage)}
          >
            {errorMessage ||
              "Scan your fingerprint on the\ndevice scanner to continue"}
          </ShakingText>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handlePopupDismissed}
          >
            <Text style={styles.buttonText}>BACK TO MAIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

FingerprintPopup.propTypes = {
  style: ViewPropTypes.style,
  handlePopupDismissed: PropTypes.func.isRequired
};

export default FingerprintPopup;
