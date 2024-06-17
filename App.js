import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from './Objects/Directory';

var root = new Directory("/", 0,  [], 'blue');
var children = [];

export default function App() {
  const [adding, setAdding] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  var nameInput = '';
  var colorInput = '';

  useEffect(() => {
    console.log("LL");
  }, [adding, errorMessage]);

  function addChild(name, order, parent, type){ // Makes child object and makes sure it is saved
    parent.addChild(name);

    let parents = [];
    if(parent.parent.length > 0){
      let parents = parent.parent;
    }
    parents.push(parent.name);
    let child = {name: name, order: order, parent: parents, type: type};
    children.push(child);
    console.log("Added: ", children);
  }

  function addChildCheck(name, order, parent, type){
    console.log("GG: ", parent.children);
    if(name = "" || name.length == 0){
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(parent.children.indexOf(name) == -1){
      addChild(name, color, parent, "Task");
      setAdding(null);
      return;
    }
    else{
      setErrorMessage('Name is Taken.');
      return;
    }
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
    if(adding == directory.name){
      return(
        <View>
          <Text>{errorMessage}</Text>
            <Text>Add Name: </Text>
            <TextInput style={styles.textInput} value={nameInput} onChangeText={(text) => {console.log("nameInput: ", text);}} placeholder='Enter Name'/>

            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} value={colorInput} onChangeText={(text) => {color = text}} placeholder='Enter Color'/>

            <Button title="Submit" onPress={() => {addChildCheck(name, color, directory, "Task" )}} />
            <Button title="Cancel" onPress={() => {setAdding(null)}} />
        </View>
    );
    }
  }

  function displayChildren(directory){
    console.log("Childs: ", directory.parent);
    let parents = [];
    if(directory.parent.length > 0){
      parents = directory.parent;
    }

    parents.push(directory.name);
    if(children.length > 0){
      console.log("Check: ", parents = children[0].parent);

    }
    const tempChildren = children.filter((e) => e.parent[e.parent.length-1] == parents[parents.length-1] &&  e.parent[e.parent.length-2] == parents[parents.length-2]);
    console.log("Temp ", tempChildren, " : ", children);
    return tempChildren.map((child) => {
      return (
        <View key={child.name+child.order} style={styles.container}>
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
  textInput: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'black',
  }
});
