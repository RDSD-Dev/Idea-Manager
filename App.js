import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from './Objects/Directory';

export default function App() {
  const [root, setRoot] = useState(null);
  const [children, setChildren] = useState([]);
  const [adding, setAdding] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
  }, [adding, errorMessage, children, root]);

  if(root == null){
    AsyncStorage.getItem('/').then((value) => {
      if(value !== null){
        console.log("Get");
        setRoot(JSON.parse(value));
      }
      else[
        console.log("Making Root"),
        setRoot(new Directory("/", 0,  [], 'blue'))
      ]
    });
  }

  function addChild(name, order, parent, type){ // Makes child object and makes sure it is saved
    //console.log("Adding: ", name);
    parent.addChild(name);

    let parents = [];
    if(parent.parent.length > 0){
      let parents = parent.parent;
    }
    parents.push(parent.name);
    let child = {name: name, order: order, parent: parents, type: type};
    children.push(child);
  }

  function addChildCheck(name, color, parent, type){
    if(name == "" || name.length == 0){
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(parent.children.indexOf(name) == -1){
      addChild(name, color, parent, "Task");
      clearInputs();
      return;
    }
    else{
      setErrorMessage('Name is Taken.');
      return;
    }
  }

  function clearInputs(){
    setAdding(false);
    setErrorMessage('');
    setNameInput('');
    setColorInput('');
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
            <TextInput style={styles.textInput} onChangeText={setNameInput} value={nameInput}/>

            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>

            <Button title="Submit" onPress={() => {addChildCheck(nameInput,colorInput, directory, "Task")}} />
            <Button title="Cancel" onPress={() => {setAdding(null)}} />
        </View>
    );
    }
  }

  function displayChildren(directory){
    let parents = [];
    if(directory.parent == undefined || directory.parent.length > 0){
      parents = directory.parent;
    }

    parents.push(directory.name);
    const tempChildren = children.filter((e) => e.parent[e.parent.length-1] == parents[parents.length-1] &&  e.parent[e.parent.length-2] == parents[parents.length-2]);
    return tempChildren.map((child) => {
      return (
        <View key={child.name+child.order} style={styles.child}>
          <Text>{child.name}</Text>
          <Text>{child.type}</Text>
        </View>
      );
    });
  }

  if(root !== null){
    return (
      <View style={styles.container}>
        {displayDirectory(root)}
        {displayForm(root)}
        {displayChildren(root)}
      </View>
    );
  }
  else{
    
  }
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
  },

  child: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'black',
    marginBottom: 4,
  },
});
