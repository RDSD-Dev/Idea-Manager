import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from './Objects/Directory';

let root = new Directory('/', 0,  [], 'blue');
let children = [];

export default function App() {
  const [adding, setAdding] = useState(null);
  console.log(root.name);

  useEffect(() => {
    //console.log('Effect');
  }, [adding]);

  function addChild(name, order, parent, type){ // Makes child object and makes sure it is saved
    parent.addChild(name);
    let parents = parent.parent;
    parents.push(parent.name);
    let child = {name: name, order: order, parent: parents, type: type};
    children.push(child);
  }

  function displayDirectory(directory){
    return(
      <View style={styles.header}>
        <Text style={ styles.headerLeft}>Settings</Text>
        <Text style={styles.headerMiddle}>Idea Manager</Text>
        <Button title="Add" style={styles.headerRight} onPress={() => {setAdding(directory.name)}} />
      </View>
    );
  }

  function displayForm(directory){
    console.log(directory.isAdding);
    if(adding == directory.name){
      return(
        <View>
            <Text>Add Name: </Text>
            <Text>Add Color: </Text>
            <Button title="Submit" onPress={() => {addChild('Test', directory.childrenNum, directory, "Task") ;setAdding(null)}} />
            <Button title="Cancel" onPress={() => {setAdding(null)}} />
        </View>
    );
    }
  }

  function displayChildren(directory){
    let jsx;
    console.log("Children: ",directory.children);
    return directory.children.map((child) => {
      let parents = directory.parent;
      parents.push(directory.name);
      let current = children.find((e) => e.name = child && e.parent == parents);
      return (
        <View key={child.name+child.order}>
          <Text>{child.name}</Text>
          <Text>{child.type}</Text>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      {displayDirectory(root)}
      {displayForm(root)}
      {displayChildren(root)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    display: 'flex', 
    flexDirection: 'row',
    backgroundColor: this.color,
    alignItems: 'center',
    paddingTop: 40,
  },
  headerLeft: {
      position: 'relative',
      left: 0,
      alignItems: 'flex-start',
      justifySelf: 'flex-start', 
      paddingRight: 10,
  },
  headerMiddle: {
      flexDirection: 'column'
  },
  headerRight: {
      justifySelf: 'right',
      alignItems: 'right',
      right: 0,
      paddingLeft: 10,
  },
});
