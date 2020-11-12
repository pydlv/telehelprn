import React from "react";
import {Button, Card, Text} from "react-native-elements";
import {View} from "react-native";

const MessagesCard = () => {
    return (
        <Card>
            <Card.Title style={{alignSelf: "flex-start"}}>
                Messages
            </Card.Title>
            <View>
                <Text>You have no new messages.</Text>
                <Button
                    containerStyle={{marginTop: 10}}
                    title="View"
                />
            </View>
        </Card>
    );
}

export default MessagesCard;
