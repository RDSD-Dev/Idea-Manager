import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory } from './Objects/Directory';

export default function App() {
  let root = new Directory('/', 0,  [], 'Blue');
  console.log(root.name);

  return (
    <View style={styles.container}>
      {root.displayMain()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
