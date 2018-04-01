import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

export class Header extends Component {
    render() {
        return(
            <View>
                <Text style={styleSheet.header}>brain.js 🤖 - React Native Example</Text>
            </View>
        )
    }
}

const styleSheet = StyleSheet.create({
    header: {
        backgroundColor: "#F3DF4A",
        padding:"10%",
        flex:1,
        fontWeight:"bold",
        fontSize:16,
        textAlign:"center"
    }
})

export default Header;