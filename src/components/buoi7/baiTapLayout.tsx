import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const BaiTapLayout = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: '#FF0000' }]}>
          <Text style={styles.number}>1</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#00FF00' }]}>
          <Text style={styles.number}>2</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#0000FF' }]}>
          <Text style={styles.number}>3</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: '#FFFF00' }]}>
          <Text style={styles.number}>4</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#FF00FF' }]}>
          <Text style={styles.number}>5</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#00FFFF' }]}>
          <Text style={styles.number}>6</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: '#800000' }]}>
          <Text style={styles.number}>7</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#008000' }]}>
          <Text style={styles.number}>8</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#000080' }]}>
          <Text style={styles.number}>9</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  box: {
    flex: 1,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BaiTapLayout;