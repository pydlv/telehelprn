import React, {Component} from "react";
import PropTypes from "prop-types";
import {View} from "react-native";
import {Text} from "react-native-elements";

class SimpleTable extends Component {
    constructor(props) {
        super(props);

        console.log(this.props);
    }


    renderRow(cells=[]) {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                {
                    cells.map((cell, i) => (
                        <View style={{ flex: 1, alignSelf: 'stretch' }} key={i}>
                            <Text>{cell}</Text>
                        </View>
                    ))
                }
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {
                    this.props.data.map((datum) => {
                        return this.renderRow(datum);
                    })
                }
            </View>
        );
    }
}

SimpleTable.propTypes = {
    data: PropTypes.array
}

export default SimpleTable;