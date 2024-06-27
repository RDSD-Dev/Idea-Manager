import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView , Pressable, Image, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [directories, setDirectories] = useState(null); // name, order#, parentKey, color, key, children[]
  const [addItem, setAddItem] = useState(null);
  const [updateItem, setUpdateItem] = useState(null); // Stores [name, order]
  const [deleteItem, setDeleteItem] = useState(null); // Stores [name, order]
  const [expandItems, setExpandedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [dropdownInput, setDropdownInput] = useState(null);
  const [imageInput, setImageInput] = useState(null);

  const childTypes = [
    {type: 'Task'},
    {type: 'Note'},
    {type: 'Image'},
    {type: 'Nested Tasks'}
  ]

  useEffect(() => {
    if(expandItems !== null && expandItems.findIndex((e) => e.type == 'Note') !== -1){
      const note = expandItems.find((e) => e.type == 'Note');
      const index = directories[directories.length-1].children.findIndex((e) => e.name == note.name && e.order == note.order);
      let tempDirectories = directories[directories.length-1];
      tempDirectories.children[index].text = textInput;
      saveDirectory(tempDirectories);
    }
    if(errorMessage == 'Refresh'){
      setErrorMessage(errorMessage + '');
    }
  }, [directories, errorMessage, addItem, updateItem, deleteItem, numberInput, textInput, imageInput, expandItems]);

  if(directories == null){
    AsyncStorage.getItem("root").then((value) => {
      if(value !== null){
        let valObj = JSON.parse(value);
        setDirectories([valObj]);
      }
      else{
        console.log("Making Root");
        let temp = {name: 'root', order: 0, parentKey: '', color: 'Grey', key: 'root', children: []};
        setDirectories([temp]);
        AsyncStorage.setItem(temp.key, JSON.stringify(temp));
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
    setTextInput('');
    setNumberInput('');
    setImageInput(null);
    setDropdownInput(null);
  }
  function addChildCheck(parentKey, name, order, type, color, image){ // Checks if the child is valid
    console.log("Image: ", image);
    if(name == "" || name.length == 0){ // Name cannot be blank
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(type == null){
      setErrorMessage('Please define a type.');
      return;
    }
    else if(type == 'directories' && directories.children.findIndex((e) => e.name == name) == -1){ // Dose not allow 2 directories of the same name to exist in the same directories
      setErrorMessage('directories Name is Taken.');
      return;
    }
    else if(type == 'Image' && image == null){
      setErrorMessage('Image cannot be empty.');
      return;
    }
    else{
      addChild(parentKey, name, order, type, color, image);
      return;
    }
  }
  function updateChildCheck(child, updateName, updateOrder, updateColor, updateImage){
      if(updateName == '' || updateName == null){
        updateName = child.name;
      }
      if(updateColor == ''|| updateColor == null){
        updateColor = child.color;
      }

      if(child.type == 'directories' && updateName !== child.name && directories.children.findIndex((e) => e.name == name) == -1){
        setErrorMessage('directories Name is Taken.');
      }
      else{
        updateChild(child, updateName, updateOrder, updateColor, updateImage);
      }
  }
  function saveDirectory(saveDirectory){
    let tempDirectories = directories;
    let index = directories.findIndex((e) => e.key == saveDirectory.key);
    tempDirectories[index] = saveDirectory;
    setDirectories(tempDirectories);
    AsyncStorage.setItem(saveDirectory.key, JSON.stringify(saveDirectory));
  }

  function sortChildren(children){
    console.log("Sort children");
    let tempChildren = [];
    for(let i=0; i<children.length; i++){
      tempChildren.push(children[children.findIndex((e) => e.order == i)]);
    }
    return tempChildren;
  }
  function expandChild(child){
    if(child.type == 'Note' && expandItems.findIndex((e) => e.type == 'Note') > -1){
      setExpandedItems(expandItems.filter((e) => e.type !== 'Note'));
    }
    setExpandedItems(expandItems => [...expandItems, {name: child.name, order: child.order, type: child.type}])
  }
  
  function addChild(parentKey, name, order, type, color, image){ // Makes child object and makes sure it is saved
    console.log("add: ", name, " : ", image);
    let tempDirectory = directories.find((e) => e.key == parentKey);
    let newChild = {name: name, order: order, parentKey: parentKey, color: color, type: type, isNested: false};
    switch(type){
      case "Task":
        newChild.style = styles.Task;
        newChild.isComplete = false;
        break;
      case "Note":
        newChild.style = styles.Note;
        newChild.text = '';
        break;
      case 'Image':
        newChild.style = styles.Picture;
        newChild.image = image;
        break;
      case 'Nested Tasks':
        newChild.style = styles.nestedTasks;
        newChild.isComplete = false;
        newChild.children = [];
        break;
    }

    tempDirectory.children.push(newChild);
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function updateChild(child, updateName, updateOrder, updateColor, updateImage){
    const oldOrder = child.order;
    console.log("Update: ", child.name, updateOrder, child.order);
    let tempDirectory = directories[directories.length-1];
    let updateChild = child;
    const index = tempDirectory.children.findIndex((e) => e.name == child.name && e.order == child.order);

    updateChild.name = updateName;
    updateChild.order = updateOrder;
    updateChild.color = updateColor;
    if(updateImage !== null){
      updateChild.image = updateImage; 
    }
    tempDirectory.children[index] = updateChild;

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
  function deleteChild(name, order, directoryKey){ // Deletes Child
    let tempDirectory = directories.find((e) => e.key == directoryKey);
    const index = tempDirectory.children.findIndex((e) => e.name == name && e.order == order );
    tempDirectory.children.splice(index, 1);
    for(let i=tempDirectory.children.length-1; i>=index; i--){
      tempDirectory.children[i].order--;
    }
    tempDirectory.children = sortChildren(tempDirectory.children);
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function toggleTask(child){
    let tempDirectory = directories[directories.length-1];
    const index = tempDirectory.children.findIndex((e) => e == child);
    tempDirectory.children[index].isComplete = !child.isComplete;
    saveDirectory(tempDirectory);
  }
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });
    if(!result.canceled){
      setImageInput(result);
    }
  }

  function displayDirectory(index){ // Displays directories at top
    const directory = directories[index];
    return(
      <View>
        <View style={styles.header}>
          <Text style={ styles.headerLeft}>Settings</Text>
          <Text style={styles.headerMiddle}>{directory.name}</Text>
          <Button title="Add" style={styles.headerRight} onPress={() => {setDropdownInput({type: 'Task'}); setAddItem(directory.name)}} />
        </View>
        {addItem !== null && addItem.constructor !== Array && displayAddForm(true)}
      </View>
    );
  }
  // directories Forms
  function displayAddForm(isDirectory){ // Displays add child form
    if(addItem !== null){
      let key;
      let order;
      if(!isDirectory){ // Checks if you are adding to a Nested item or directory
        console.log("Arr");
        key = addItem;
        order = addItem[2];
      }
      else{
        const directory = directories.find((e) => e.name == addItem);
        key = directory.key;
        order = directory.children.length;
      }
      console.log(addItem);
      return(
        <View>
          <Text>{errorMessage}</Text>
            <Text>Add Name: </Text>
            <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name'/>
            <Text>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>
            {isDirectory == true && <Dropdown data={childTypes} labelField='type' valueField='type' value={dropdownInput} onChange={setDropdownInput}/>}
            {dropdownInput !== null && dropdownInput.type == 'Image' && displayImageForm()}
            <Button title="Submit" onPress={() => {addChildCheck(key, nameInput, order, dropdownInput.type, colorInput, imageInput)}} />
            <Button title="Cancel" onPress={() => {clearInputs(); setAddItem(null)}} />
        </View>
    );
    }
  }
  function displayImageForm(){
    return(
      <View>
        <Button title="Pick an image from camera roll" onPress={pickImage} />
    </View>
    );
  }
// Display Children
  function displayChildren(index){ // Displays children of directories
    return directories[index].children.map((child) => {
      switch(child.type){
        case 'Task':
          return displayTask(child);
        case 'Note':
          return displayNote(child);
        case 'Image':
          return displayImage(child);
        case 'Nested Tasks':
          return displayNestedTasks(child);
      }
    });
  }
  function displayNestedChildren(children){

  }
  function displayTask(child){
    return (
      <View key={child.name+child.order} style={child.style}>
        <Text>{child.name}</Text>
        <Text>{JSON.stringify(child.isComplete)}</Text>
        <Button title='Complete' onPress={() => {setErrorMessage('Refresh'); toggleTask(child)}}/>
        <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order, child.parentKey])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>

          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && displayUpdateChildForm(child)}
      </View>
    );
  }
  function displayNote(child){
    if(expandItems.length == 0 || expandItems.findIndex((e) => e.name == child.name && e.order == child.order) == -1){
      return (
        <View key={child.name+child.order} style={child.style}>  
          <Pressable onPress={() => {setTextInput(child.text); expandChild(child)}}>
            <Text>{child.name}</Text>
            <Text>{child.type}</Text>
            <Text multiline={false} style={styles.NoteTextPrev}>{child.text}</Text>
          </Pressable>
          <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>
  
            {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
        </View>
      );
    }
    else{
      return displayNoteForm(child);
    }
  }
  function displayImage(child){
    return (
      <View key={child.name+child.order} style={child.style}>
        <Pressable onPress={() => expandChild(child)}>
          <Text>{child.name}</Text>
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 &&
            <Button title='Back' onPress={() => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) == -1 && 
            <Image style={styles.miniPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 && 
            <Image style={styles.fullPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
        </Pressable>
        <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order, child.parentKey])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>

          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && displayUpdateImageForm(child)}
      </View>
    );
  }
  function displayNestedTasks(child){
    if(child.children.length > 0 && child.children.findIndex((e) => e.isComplete == false) == -1){
      toggleTask(child);
    }
    return(
      <View key={child.name + child.order} style={child.style}>
        <Pressable onPress={() => {expandChild(child)}}>
            <Text>{child.name}</Text>
            <Text>{child.type}</Text>
            <Text>{JSON.stringify(child.isComplete)}</Text>
          </Pressable>
          <Button title='Add' onPress={() => {clearInputs(); setAddItem([child.name, child.order, child.children.length]); setDropdownInput({type: 'Task'})}}/>
          {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && displayAddForm(false)}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 && 
            <View>
              <Button title='Back' onPress={() => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}/>
              <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>
              {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
              {displayNestedChildren(child.children)}
            </View>}
      </View>
    );
  }
  // Child Forms
  function displayNoteForm(child){
    return(
      <View key={child.name+child.order} style={child.style}>  
        <Button title='Back' onPress={() => {clearInputs(); setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}}/>
        <Text>{child.name}</Text>
        <TextInput value={nameInput} onChangeText={setNameInput} placeholder={child.name}/>
        <Button title='Update' onPress={() => {updateChildCheck(child, nameInput); setTextInput(child.text); setUpdateItem([child.name, child.order, child.parentKey, child.type])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order])}}/>
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
        <TextInput value={textInput} onChangeText={setTextInput} multiline={true} placeholder='Enter Note Here'/>
      </View>
    );
  }
  function displayUpdateChildForm(child){ // Displays item update form
    let tempNum;
    if(updateItem !== null){
      tempNum = parseInt(numberInput);
      const limit = directories[directories.length-1].children.length;
      if(tempNum < 0){
        setNumberInput('0');
      }
      else if(tempNum >= limit){
        setNumberInput('' + limit-1);
      }
      else if(numberInput == null || numberInput == ''){
        tempNum = child.order;
      }
    }
    return(
      <View>
        <TextInput value={nameInput} onChangeText={setNameInput} placeholder='Enter Updated Name'/>
        <TextInput value={numberInput} onChangeText={setNumberInput} keyboardType='numeric'placeholder='Enter Updated Order #'/>

        <TextInput value={colorInput} onChangeText={setColorInput} placeholder='Enter Updated Color'/>
        
        <Button title='Submit' onPress={() => updateChildCheck(child, nameInput, tempNum, colorInput)}/>
        <Button title='Cancel' onPress={() => clearInputs()}/>
      </View>
    );
  }
  function displayUpdateImageForm(child){
    let tempNum;
    if(updateItem !== null){
      tempNum = parseInt(numberInput);
      const limit = directories[directories.length-1].children.length;
      if(tempNum < 0){
        setNumberInput('0');
      }
      else if(tempNum >= limit){
        setNumberInput('' + limit-1);
      }
      else if(numberInput == null || numberInput == ''){
        console.log("null");
        tempNum = child.order;
      }
    }
    return(
      <View>
        <TextInput value={nameInput} onChangeText={setNameInput} placeholder='Enter Updated Name'/>
        <TextInput value={numberInput} onChangeText={setNumberInput} keyboardType='numeric'placeholder='Enter Updated Order #'/>

        <TextInput value={colorInput} onChangeText={setColorInput} placeholder='Enter Updated Color'/>
        {displayImageForm()}
        <Button title='Submit' onPress={() => updateChildCheck(child, nameInput, tempNum, colorInput, imageInput)}/>
        <Button title='Cancel' onPress={() => clearInputs()}/>
      </View>
    );
  }
  function displayDeleteChildForm(child){ // Displays item delete form
    return(
      <View>
          <Text>Delete {child.name}?</Text>
                <Button title='Yes' onPress={() => deleteChild(child.name, child.order, child.parentKey)}/>
                <Button title='No' onPress={() => {if(updateItem[0] == child.name && updateItem[1] == child.order){setDeleteItem(null)}else{clearInputs()}}}/>
      </View>
    );
  }

  if(directories !== null){ // Displays directories if not null
    return (
      <View style={styles.container}>
        {displayDirectory(0)}
        <ScrollView>
        {displayChildren(0)}
        </ScrollView>
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
  childdirectories:{
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
  Note: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'blue',
    marginBottom: 4,
    width: '80vw',
  },
  NoteTextPrev: {
    height: 16,
  },
  Picture:{
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'grey',
    marginBottom: 4,
  },
  miniPic: {
    height: 100,
  },
  fullPic: { 
    height: 260,
  },
  nestedTasks: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'pink',
    marginBottom: 4,
    width: '80vw',
  }


});
