import React, {Component} from "react";
import PropTypes from "prop-types";
import {Image} from "react-native-elements";
import {S3_HOST} from "../consts";
import {ActivityIndicator, View} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

class ProfilePicture extends Component {
    render() {
        return (
            <View>
                {this.props.imageURL ?
                        <Image
                            source={{ uri: `https://${S3_HOST}/profile-pictures/${this.props.imageURL}`}}
                            style={{width: 150, height: 150}}
                            PlaceholderContent={<ActivityIndicator />}
                            resizeMethod="scale"
                        /> :
                        <Icon
                            name="user-circle"
                            size={150}
                        />
                }
            </View>
        );
    }
}

ProfilePicture.propTypes = {
    imageURL: PropTypes.string
}

export default ProfilePicture;