import React from "react";
import {View, Text, StyleSheet} from "react-native";

const HelloWorld = () => {
    return (
        <View style={styles.container}> 
        <Text style={styles.text}>Hello, tran phuoc thanh phng!</Text> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        color: "#333",
    },
});

export default HelloWorld;
