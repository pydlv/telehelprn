import React, {Component} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import HeaderWithBackButton from "./HeaderWithBackButton";
import {getAuthedAPI} from "../api";
import {ListItem, Text} from "react-native-elements";
import strings from "../strings";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome";


class ProviderListItem extends Component {
    render(): React.ReactNode {
        return (
            <TouchableOpacity style={styles.providerListItemTouchableOpacity}>
                <View style={styles.providerListItemView}>
                    <Text style={{fontWeight: "600"}}>{this.props.name}</Text>
                    <Icon
                        name="chevron-right"
                    />
                </View>
            </TouchableOpacity>
        );
    }
}

ProviderListItem.propTypes = {
    name: PropTypes.string
}


class ProviderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            providers: []
        }
    }

    componentDidMount(): void {
        getAuthedAPI()
            .listProviders()
            .then((response) => {
                this.setState({
                    providers: response.providers
                })
            });
    }

    render(): React.ReactNode {
        return (
            <View style={{flex: 1}}>
                <HeaderWithBackButton headerText={strings.pages.selectProvider.headerText} />
                <ScrollView style={{flex: 1}}>
                    {this.state.providers.map((provider, i) => (
                        <ListItem
                            key={i}
                            Component={ProviderListItem}
                            name={provider.name}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    providerListItemTouchableOpacity: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingTop: 20,
        paddingBottom: 20
    },

    providerListItemView: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        marginLeft: 15,
        marginRight: 15,
        alignItems: "center"
    }
});

export default ProviderList;