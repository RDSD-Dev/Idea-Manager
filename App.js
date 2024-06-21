import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from './Objects/Directory';
import { Task } from './Objects/Task';
import { jsx } from 'react/jsx-runtime';

export default function App() {
  const [directory, setDirectory] = useState(null);
  const [adding, setAdding] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
  }, [adding, errorMessage, directory]);

  if(directory == null){
    AsyncStorage.getItem("root").then((value) => {
      if(value !== null){
        console.log("Get: ", JSON.parse(value));
        setDirectory(JSON.parse(value));
      }
      else{
        console.log("Making Root");
        let temp = {name: 'root', children: [], key: 'root'}
        setDirectory(temp);
        AsyncStorage.setItem("root", JSON.stringify(temp));
      }
    });
  }

  function addChild(name, order, type){ // Makes child object and makes sure it is saved
    console.log("Adding: ", name);
    let tempDirectory = directory;
    let newChild;
    switch(type){
      case "Task":
        newChild = new Task(name, order, directory.key, colorInput);
        break;
    }

    tempDirectory.children.push(newChild);
    saveDirectory(tempDirectory);
  }

  function saveDirectory(tempDirectory){
    setDirectory(tempDirectory);
    AsyncStorage.setItem(tempDirectory.key, JSON.stringify(tempDirectory));
  }

  function addChildCheck(name, color, type){
    if(name == "" || name.length == 0){
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(directory.children.indexOf(name) == -1){ // Name dose not exist
      addChild(name, color, "Task");
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

  function displayDirectory(){
    return(
      <View style={styles.header}>
        <Text style={ styles.headerLeft}>Settings</Text>
        <Text style={styles.headerMiddle}>Idea Manager</Text>
        <Button title="Add" style={styles.headerRight} onPress={() => {setAdding(directory.name)}} />
      </View>
    );
  }

  function displayForm(){
    if(adding == directory.name){
      return(
        <View>
          <Text>{errorMessage}</Text>
            <Text>Add Name: </Text>
            <TextInput style={styles.textInput} onChangeText={setNameInput} value={nameInput}/>

            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>

            <Button title="Submit" onPress={() => {addChildCheck(nameInput, colorInput, "Task")}} />
            <Button title="Cancel" onPress={() => {setAdding(null)}} />
        </View>
    );
    }
  }

  function displayChildren(){
    console.log(directory);
    return directory.children.map((child) => {
      return (
        <View key={child.name+child.order} style={styles.child}>
          <Text>{child.name}</Text>
          <Text>{child.type}</Text>
        </View>
      );
    });
  }

  if(directory !== null){
    return (
      <View style={styles.container}>
        {displayDirectory()}
        {displayForm()}
        {displayChildren()}
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
