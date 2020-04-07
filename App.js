import React from 'react';
import {View} from 'react-native';
import VideoSession from './Components/VideoSession';

const App: () => React$Node = () => {
    return (
        <>
            <View>
                <VideoSession />
            </View>
        </>
    );
};

export default App;
