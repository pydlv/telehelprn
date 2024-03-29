import React, {Component} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import HeaderWithBackButton from "./HeaderWithBackButton";
import strings from "../strings";
import {Text} from "react-native-elements";
import EditProfile from "./EditProfile";
import ProviderSettings from "./ProviderSettings";
import {Actions} from "react-native-router-flux";
import {boundMethod} from "autobind-decorator";
import {connect} from "react-redux";
import {AccountType} from "../consts";
import Security from "./Security";
import Icon from "react-native-vector-icons/FontAwesome5";

class Settings extends Component {
    constructor(props) {
        super(props);

        this.tabs = [
            {title: strings.pages.settings.profileSettings},
            {title: strings.pages.settings.securitySettings}
        ];

        if (this.props.accountType === AccountType.Provider) {
            this.isProvider = true;
            this.tabs.push({title: strings.pages.settings.providerSettings});
        } else {
            this.isProvider = false;
        }

        const initialIndex = this.props.tabIndex !== undefined ? this.props.tabIndex : 0;

        this.state = {
            activeTabIndex: initialIndex
        };
    }

    activeTabComponent() {
        switch (this.state.activeTabIndex) {
            case 0:
                return (<EditProfile />);
            case 1:
                return (<Security />)
            case 2:
                return (<ProviderSettings />);
        }
    }

    @boundMethod
    onTabPress(index) {
        this.setState({
            activeTabIndex: index
        });
        Actions.popAndPush("settings", {tabIndex: index});
    }

    render() {
        return (
            <ScrollView>
                <HeaderWithBackButton
                    headerText={strings.pages.settings.headerText}
                    showBackButton={this.props.showBackButton}
                    rightComponent={
                        <Icon
                            name='info-circle'
                            size={24}
                            color='white'
                            style={{marginRight: 15, marginBottom: 0}}
                            onPress={() => Actions.push("about")}
                        />
                    }
                />

                {this.tabs.length > 1 &&
                    <View style={styles.tabContainer}>
                        {
                            this.tabs.map((element, i) => {
                                const title = element.title;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={i === this.state.activeTabIndex ? {
                                            'width': (100 / this.tabs.length).toString() + "%",
                                            ...styles.tab,
                                            ...styles.activeTab
                                        } : {
                                            'width': (100 / this.tabs.length).toString() + "%",
                                            ...styles.tab
                                        }}
                                        onPress={() => this.onTabPress(i)}
                                    >
                                        <Text style={styles.tabText}>{title}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                }

                {this.activeTabComponent()}
            </ScrollView>
        );
    }
}

Settings.defaultProps = {
    tabIndex: 0,
    showBackButton: true
}

const styles = StyleSheet.create({
    tabContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    tab: {
        // width: "50%",
        minHeight: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#38a2f5"
    },

    activeTab: {
        borderBottomWidth: 2
    },

    tabText: {
        textAlign: "center",
        color: "white"
    }
});

function mapStateToProps(state) {
    return {
        accountType: state.accountType
    };
}

export default connect(mapStateToProps)(Settings);
