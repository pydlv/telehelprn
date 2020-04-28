import {Button, Header, Text} from "react-native-elements";
import React, {Component} from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import {Actions} from "react-native-router-flux";

class HeaderWithBackButton extends Component {
    render() {
        return (
            <Header
                placement="left"
                leftComponent={this.props.showBackButton !== false &&
                    <Button
                        icon={
                            <Icon
                                name='arrow-left'
                                size={24}
                                color="white"
                            />
                        }
                        onPress={Actions.pop}
                        containerStyle={{marginRight:10}}
                    />
                }
                centerComponent={<Text h4 h4Style={{color: "white"}}>{this.props.headerText}</Text>}
            />
        );
    }
}

HeaderWithBackButton.defaultProps = {
    showBackButton: true,
    headerText: null
}


export default HeaderWithBackButton;