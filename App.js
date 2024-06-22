import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from './Objects/Directory';
import { Task } from './Objects/Task';
import { jsx } from 'react/jsx-runtime';

export default function App() {
  const [directory, setDirectory] = useState(null);
  const [addItem, setAddItem] = useState(null);
  const [updateItem, setUpdateItem] = useState(null); // Stores [name, order]
  const [deleteItem, setDeleteItem] = useState(null); // Stores [name, order]
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {

  }, [directory, errorMessage, addItem, updateItem, deleteItem]);

  if(directory == null){
    AsyncStorage.getItem("root").then((value) => {
      if(value !== null){
        let valObj = JSON.parse(value);
        let temp = new Directory('', 0, '', '');
        temp.setAll(valObj.name, valObj.order, valObj.parentKey, valObj.color, valObj.key, valObj.children);
        setDirectory(temp);
      }
      else{
        console.log("Making Root");
        let temp = new Directory('root', 0, '', 'Grey');
        setDirectory(temp);
        AsyncStorage.setItem("root", JSON.stringify(temp));
      }
    });
  }

  function clearInputs(){ // Clears all inputs
    setAddItem(null);
    setUpdateItem(null);
    setDeleteItem(null);
    setErrorMessage('');
    setNameInput('');
    setColorInput('');
  }

  function addChildCheck(name, order, type, color){ // Checks if the child is valid
    if(name == "" || name.length == 0){ // Name cannot be blank
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(type == 'directory' && directory.children.findIndex((e) => e.name == name) == -1){ // Dose not allow 2 directories of the same name to exist in the same directory
      setErrorMessage('Name is Taken.');
      return;
    }
    else{
      addChild(name, order, type, color);
      return;
    }
  }
  function addChild(name, order, type, color){ // Makes child object and makes sure it is saved
    console.log("add: ", name);
    let tempDirectory = directory;
    let newChild;
    switch(type){
      case "Task":
        newChild = new Task(name, order, directory.key, colorInput);
        break;
    }

    tempDirectory.pushChild(newChild);
    setDirectory(tempDirectory);
    clearInputs();
  }
  function deleteChild(name, order){ // Deletes Child
    let tempDirectory = directory;
    tempDirectory.deleteChild(name, order);
    setDirectory(tempDirectory);
    clearInputs();
  }

  function displayDirectory(){ // Displays Directory at top
    return(
      <View style={styles.header}>
        <Text style={ styles.headerLeft}>Settings</Text>
        <Text style={styles.headerMiddle}>Idea Manager</Text>
        <Button title="Add" style={styles.headerRight} onPress={() => {setAddItem(directory.name)}} />
      </View>
    );
  }
  function displayAddForm(){ // Displays add child form
    if(addItem == directory.name){
      return(
        <View>
          <Text>{errorMessage}</Text>
            <Text>Add Name: </Text>
            <TextInput style={styles.textInput} onChangeText={setNameInput} value={nameInput}/>

            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>

            <Button title="Submit" onPress={() => {addChildCheck(nameInput, directory.children.length, "Task", colorInput)}} />
            <Button title="Cancel" onPress={() => {setAddItem(null)}} />
        </View>
    );
    }
  }
  function displayChildren(){ // Displays children of directory
    return directory.children.map((child) => {
      return (
        <View key={child.name+child.order} style={styles.child}>
          <Text>{child.name}</Text>
          <Text>{child.type}</Text>
          <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order])}}/>
          <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order])}}/>
            
            {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && <View>
                <Text>Delete {child.name}?</Text>
                <Button title='Yes' onPress={() => deleteChild(child.name, child.order)}/>
                <Button title='No' onPress={() => clearInputs()}/>
              </View>}
            {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && <View>
              <Text>Update {child.name}</Text>
              <Text>Name: </Text>
              <TextInput multiline={true} value={nameInput} onChangeText={setNameInput}/>
              <Button title='Submit' onPress={() => clearInputs()}/>
              <Button title='Cancel' onPress={() => clearInputs()}/>
              </View>}
        </View>
      );
    });
  }

  if(directory !== null){ // Displays directory if not null
    return (
      <View style={styles.container}>
        {displayDirectory()}
        {displayAddForm()}
        {displayChildren()}
      </View>
    );
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
