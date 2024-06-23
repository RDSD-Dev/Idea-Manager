import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { jsx } from 'react/jsx-runtime';

import {} from './Child';

export default function App() {
  const [directory, setDirectory] = useState(null); // name, order#, parentKey, color, key, children[]
  const [addItem, setAddItem] = useState(null);
  const [updateItem, setUpdateItem] = useState(null); // Stores [name, order]
  const [deleteItem, setDeleteItem] = useState(null); // Stores [name, order]
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [dropdownInput, setDropdownInput] = useState(null);

  const childTypes = [
    {type: 'Task'}
  ]

  useEffect(() => {

  }, [directory, errorMessage, addItem, updateItem, deleteItem, numberInput]);

  if(directory == null){
    AsyncStorage.getItem("root").then((value) => {
      if(value !== null){
        let valObj = JSON.parse(value);
        setDirectory(valObj);
      }
      else{
        console.log("Making Root");
        let temp = {name: 'root', order: 0, parentKey: '', color: 'Grey', key: 'root', children: []};
        saveDirectory(temp);
      }
    });
  }

  function clearInputs(){ // Clears all inputs
    console.log("Clear");
    setAddItem(null);
    setUpdateItem(null);
    setDeleteItem(null);
    setErrorMessage('');
    setNameInput('');
    setColorInput('');
    setDropdownInput(null);
  }
  function addChildCheck(name, order, type, color){ // Checks if the child is valid
    if(name == "" || name.length == 0){ // Name cannot be blank
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(type == null){
      setErrorMessage('Please define a type.');
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
  function saveDirectory(directory){
    setDirectory(directory);
    AsyncStorage.setItem(directory.key, JSON.stringify(directory));
  }

  function sortChildren(children){
    console.log("Sort children");
    let tempChildren = [];
    for(let i=0; i<children.length; i++){
      tempChildren.push(children[children.findIndex((e) => e.order == i)]);
    }
    return tempChildren;
  }
  
  function addChild(name, order, type, color){ // Makes child object and makes sure it is saved
    console.log("add: ", name);
    let tempDirectory = directory;
    let newChild;
    switch(type){
      case "Task":
        newChild = {name: name, order: order, parentKey: directory.key, color: colorInput, type: type, style: styles.Task};
        break;
    }

    tempDirectory.children.push(newChild);
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function updateChild(child, updateName, updateOrder, updateColor){
    const oldOrder = child.order;
    console.log("Update: ", child.name, updateOrder, child.order);
    let tempDirectory = directory;
    let updateChild = child;
    const index = directory.children.findIndex((e) => e.name == child.name && e.order == child.order);

    updateChild.name = updateName;
    updateChild.order = updateOrder;
    updateChild.color = updateColor;
    tempDirectory.children[index] = updateChild;

    console.log("Old: ", oldOrder);
    if(oldOrder > updateOrder){
      console.log("New is less");
      for(let i=updateOrder; i<oldOrder;i++){
        tempDirectory.children[i].order++;
      }
      tempDirectory.children = sortChildren(tempDirectory.children);
    }
    else if(oldOrder < updateOrder){
      console.log("New is more");
      for(let i=oldOrder+1; i<=updateOrder; i++){
        tempDirectory.children[i].order--;
      }
      tempDirectory.children = sortChildren(tempDirectory.children);
    }

    saveDirectory(tempDirectory);
    clearInputs();
  }
  function deleteChild(name, order){ // Deletes Child
    let tempDirectory = directory;
    const index = tempDirectory.children.findIndex((e) => e.name == name && e.order == order );
    tempDirectory.children.splice(index, 1);
    for(let i=tempDirectory.children.length-1; i>=index; i--){
      tempDirectory.children[i].order--;
    }
    tempDirectory.children = sortChildren(tempDirectory.children);
    saveDirectory(tempDirectory);
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
  // Directory Forms
  function displayAddForm(){ // Displays add child form
    if(addItem == directory.name){
      return(
        <View>
          <Text>{errorMessage}</Text>
            <Text>Add Name: </Text>
            <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name'/>

            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>
            <Dropdown data={childTypes} labelField='type' valueField='type' value={dropdownInput} onChange={setDropdownInput}/>
            <Button title="Submit" onPress={() => {addChildCheck(nameInput, directory.children.length, dropdownInput.type, colorInput)}} />
            <Button title="Cancel" onPress={() => {clearInputs(); setAddItem(null)}} />
        </View>
    );
    }
  }
// Display Children
  function displayChildren(){ // Displays children of directory
    return directory.children.map((child) => {
      switch(child.type){
        case 'Task':
        return displayTask(child);
      }
    });
  }
  function displayTask(child){
    return (
      <View key={child.name+child.order} style={child.style}>
        <Text>{child.name}</Text>
        <Text>{child.type}</Text>
        <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order])}}/>

          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && displayUpdateChildForm(child)}
      </View>
    );
  }
  // Child Forms
  function displayUpdateChildForm(child){ // Displays item update form
    let tempNum;
    if(updateItem !== null){
      tempNum = parseInt(numberInput);
      console.log(tempNum);
      const limit = directory.children.length;
      if(tempNum < 0){
        setNumberInput('0');
      }
      else if(tempNum >= limit){
        setNumberInput('' + limit-1);
      }
      else if(numberInput == null || ''){
        tempNum = child.order;
      }
    }
    return(
      <View>
        <TextInput value={nameInput} onChangeText={setNameInput} placeholder='Enter Updated Name'/>
        <TextInput value={numberInput} onChangeText={setNumberInput} keyboardType='numeric'placeholder='Enter Updated Order #'/>

        <TextInput value={colorInput} onChangeText={setColorInput} placeholder='Enter Updated Color'/>
        
        <Button title='Submit' onPress={() => updateChild(child, nameInput, tempNum, colorInput)}/>
        <Button title='Cancel' onPress={() => clearInputs()}/>
      </View>
    );
  }
  function displayDeleteChildForm(child){ // Displays item delete form
    return(
      <View>
          <Text>Delete {child.name}?</Text>
                <Button title='Yes' onPress={() => deleteChild(child.name, child.order)}/>
                <Button title='No' onPress={() => clearInputs()}/>
      </View>
    );
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
  childDirectory:{
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'black',
    marginBottom: 4,
  },
  Task: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
    marginBottom: 4,
  },

});
