import React, {Component} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import HeaderWithBackButton from "./HeaderWithBackButton";
import {getAuthedAPI} from "../api";
import {ListItem, Text} from "react-native-elements";
import strings from "../strings";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome";
import {boundMethod} from "autobind-decorator";
import {Actions} from "react-native-router-flux";
import {sprintf} from "sprintf-js";


class ProviderListItem extends Component {
    @boundMethod
    onConfirm() {
        getAuthedAPI()
            .setProvider(this.props.uuid)
            .then(() => {
                Actions.home()
            })
    }

    @boundMethod
    onTap() {
        Actions.push("confirmPrompt", {
            title: strings.pages.selectProvider.confirmRequestProviderTitle,
            subtitle: sprintf(strings.pages.selectProvider.confirmRequestProviderSubtitle, this.props.name),
            onConfirm: this.onConfirm,
            onCancel: () => {}
        });
    }

    render(): React.ReactNode {
        return (
            <TouchableOpacity
                style={styles.providerListItemTouchableOpacity}
                onPress={this.onTap}
            >
                <View style={styles.providerListItemView}>
                    <Text style={{fontWeight: "600"}}>{this.props.name}, {this.props.uuid}</Text>
                    <Icon
                        name="chevron-right"
                    />
                </View>
            </TouchableOpacity>
        );
    }
}

ProviderListItem.propTypes = {
    name: PropTypes.string,
    uuid: PropTypes.string
}


class ProviderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            providers: [],
            loading: true
        }
    }

    componentDidMount(): void {
        getAuthedAPI()
            .listProviders()
            .then((response) => {
                this.setState({
                    providers: response.providers,
                    loading: false
                })
            });
    }

    render(): React.ReactNode {
        return (
            <View style={{flex: 1}}>
                <HeaderWithBackButton headerText={strings.pages.selectProvider.headerText} />
                {!this.state.loading ?
                    <ScrollView style={{flex: 1}}>
                        {this.state.providers.map((provider, i) => (
                            <ListItem
                                key={i}
                                Component={ProviderListItem}
                                name={provider.name}
                                uuid={provider.uuid}
                            />
                        ))}
                    </ScrollView>
                    : <View>
                        <Text>Loading please wait.</Text>
                    </View>
                }
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