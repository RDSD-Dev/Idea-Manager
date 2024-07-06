import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView , Pressable, Image, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';

export default function App() {
  const [modalView, setModalView] = useState(null);
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
  const [booleanInput, setBooleanInput] = useState(true);
  
  const [themes, setThemes] = useState([
    {
      theme: 'Dark', backgroundColor: "#0D1B2A", modalBackgroundColor: '#14273E', 
      childrenBackgroundColor: '#18324E', itemBackgroundColor: '#26507D', nestBackgroundColor: '#285585',
      inputBackgroundColor: '#2F649D', textColor: '#E0E1DD', inputTextColor: '#E0E1DD', 
      borderColor: '#000000',borderWidth: 2, borderStyle: 'solid', fontSize: 16, headerFontSize: 20, inputFontSize: 18, borderRadius: 20}
  ]);
  const [settings, setSettings] = useState({theme: 'Dark'});

  const childTypes = [
    {type: 'Task'},
    {type: 'Note'},
    {type: 'Image'},
    {type: 'Nested Tasks'},
    {type: 'Nested Images'},
    {type: 'Directory'}
  ];

  useEffect(() => {
    if(expandItems !== null && expandItems.findIndex((e) => e.type == 'Note') !== -1){
      const note = expandItems.find((e) => e.type == 'Note');
      const directoryIndex = directories.findIndex((e) => e.key == note.parentKey);
      const index = directories[directoryIndex].children.findIndex((e) => e.name == note.name && e.order == note.order);
      let tempDirectories = directories[directoryIndex];
      tempDirectories.children[index].text = textInput;
      saveDirectory(tempDirectories);
    }
    if(errorMessage == 'Refresh'){
      setErrorMessage(errorMessage + ' ');
    }
  }, [directories, errorMessage, addItem, updateItem, deleteItem, numberInput, textInput, imageInput, expandItems]);

  if(directories == null){
    AsyncStorage.getItem("Idea Manager").then((value) => {
      if(value !== null){
        let valObj = JSON.parse(value);
        setDirectories([valObj]);
      }
      else{
        console.log("Making Root");
        let temp = {name: 'Idea Manager', order: 0, parentKey: '', color: 'Grey', key: 'Idea Manager', children: [], showCompleted: true};
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
    setBooleanInput(true);
  }
  function addChildCheck(parentKey, name, order, type, color, image){ // Checks if the child is valid
    if(name == "" || name.length == 0){ // Name cannot be blank
      setErrorMessage('Name cannot be blank.');
      return;
    }
    else if(type == null){
      setErrorMessage('Please define a type.');
      return;
    }
    else if(type == 'Directory' && name == 'Idea Manager' || type == 'Directory' && directories.find((e) => e.key == parentKey).children.findIndex((e) => e.type == 'Directory' && e.name == name) !== -1 ){ // Dose not allow 2 directories of the same name to exist in the same directories
      const directory = directories.find((e) => e.key == parentKey);
      setErrorMessage('Directory Name is Taken.');
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
  function updateChildCheck(child, updateName, updateOrder, updateColor, updateImage, updateBoolean){
      if(updateName == '' || updateName == null){
        updateName = child.name;
      }
      if(updateColor == ''|| updateColor == null){
        updateColor = child.color;
      }
      if(updateOrder == '' || updateOrder == null){
        updateOrder = child.order;
      }

      if(child.type == 'Directory' && updateName !== child.name && directories[directories.findIndex((e) => e.key == child.parentKey)].children.findIndex((e) => e.name == child.name) == -1){
        setErrorMessage('directories Name is Taken.');
      }
      else{
        updateChild(child, updateName, updateOrder, updateColor, updateImage, updateBoolean);
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
    setExpandedItems(expandItems => [...expandItems, {name: child.name, order: child.order, type: child.type, parentKey: child.parentKey}])
  }
  
  function addChild(parentKey, name, order, type, color, image){ // Makes child object and makes sure it is saved
    console.log("add: ", name, " : ", type, " To : ", parentKey);
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
      case 'Nested Images':
        newChild.style = styles.nestedImages;
        newChild.children = [];
        break;
      case 'Directory':
        newChild.style = styles.childDirectory;
        newChild.children = [];
        newChild.key = parentKey + "/" +  name;
        newChild.showCompleted = true;
        saveDirectory(newChild);
        break;
    }

    let tempDirectory;
    if(parentKey.constructor === Array){ // Adding to a nested item
      tempDirectory = directories.find((e) => e.key == parentKey[3]);
      const index = tempDirectory.children.findIndex((e) => e.name == parentKey[0] && e.order == parentKey[1]);
      tempDirectory.children[index].children.push(newChild);
    }
    else{ // Adding to a directory
      tempDirectory = directories.find((e) => e.key == parentKey);
      tempDirectory.children.push(newChild);
    }
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function updateChild(child, updateName, updateOrder, updateColor, updateImage, updateBoolean){
    const oldName = child.name;
    const oldOrder = child.order;
    let tempDirChildren;
    let updateChild = child;
    if(child.type == 'Directory'){
      tempDirChildren = directories[directories.findIndex((e) => e.key == child.key)].children;
      console.log("Work Pls ", tempDirChildren);
      updateChild.children = [];
      updateChild.key = child.parentKey + '/'+updateName;
    }
    console.log("Update: ", child.name, " : ", updateName, child.order, ' From: ', child.parentKey);
    updateChild.name = updateName;
    updateChild.order = updateOrder;
    updateChild.color = updateColor;

    if(updateImage !== null){
      updateChild.image = updateImage; 
    }
    else if(updateBoolean !== null){
      updateChild.showCompleted = updateBoolean;
    }

    let tempDirectory;;
    let tempChildren;
    let nestIndex = -1;
    if(updateChild.parentKey.constructor === Array){ // Is updating a nested item
      tempDirectory = directories.find((e) => e.key == updateChild.parentKey[3]);
      nestIndex = tempDirectory.children.findIndex((e) => e.name == updateChild.parentKey[0] && e.order == updateChild.parentKey[1]);
      tempChildren = tempDirectory.children[nestIndex].children;
    }
    else{
      if(child.parentKey == ''){
        console.log("Updating Root Directory", updateChild);
        saveDirectory(updateChild);
        clearInputs();
        return;
      }
      tempDirectory = directories.find((e) => e.key == child.parentKey);
      tempChildren = tempDirectory.children;
    }

    const index = tempChildren.findIndex((e) => e.name == oldName && e.order == oldOrder);
    tempChildren[index] = updateChild;
    tempChildren[index].name = updateName;

    if(oldOrder > updateOrder){
      for(let i=updateOrder; i<oldOrder;i++){
        tempChildren[i].order++;
      }
      tempChildren = sortChildren(tempChildren);
    }
    else if(oldOrder < updateOrder){
      for(let i=oldOrder+1; i<=updateOrder; i++){
        tempChildren[i].order--;
      }
      tempChildren = sortChildren(tempChildren);
    }
    tempChildren[index].name = updateName;
    if(nestIndex > -1){
      tempDirectory.children[nestIndex].children = tempChildren;
    }
    else{
      tempChildren[index].name = updateName;
      console.log("Test", tempChildren[0].name);
      tempDirectory.children = tempChildren;
      console.log(tempDirectory.children[0].name);
    }
    if(child.type == 'Directory'){
      closeDirectory(child);

      let tempDirectories = directories;
      const directoryIndex = tempDirectories.findIndex((e) => e.key == child.key);
      updateChild.children = tempDirChildren;
      if(oldName.name !== updateName){
        for(let i=0; i< updateChild.children.length; i++){
          updateChild.children[i].parentKey = updateChild.key;
        }
        AsyncStorage.removeItem(child.key);
        updateChild.key = child.parentKey + '/' + updateName;
      }
      AsyncStorage.setItem(updateChild.key, JSON.stringify(updateChild));
      tempDirectories.splice(directoryIndex, 1, updateChild);
      setDirectories(tempDirectories);
    }

    saveDirectory(tempDirectory);
    clearInputs();
    setUpdateItem(null);
  }
  function deleteChild(name, order, parentKey, key){ // Deletes Child
    let tempDirectory;
    let tempChildren;
    let nestIndex = -1;
    if(parentKey.constructor === Array){
      tempDirectory = directories.find((e) => e.key == parentKey[3]);
      nestIndex = tempDirectory.children.findIndex((e) => e.name == parentKey[0] && e.order == parentKey[1]);
      tempChildren = tempDirectory.children[nestIndex].children;
    }
    else{
      tempDirectory = directories.find((e) => e.key == parentKey);
      tempChildren = tempDirectory.children;
    }

    const index = tempChildren.findIndex((e) => e.name == name && e.order == order );
    tempChildren.splice(index, 1);
    for(let i=tempChildren.length-1; i>=index; i--){
      tempChildren[i].order--;
    }
    tempChildren = sortChildren(tempChildren);
    if(nestIndex > -1){
      tempDirectory.children[nestIndex].children = tempChildren;
    }
    else{
      tempDirectory.children = tempChildren;
    }
    if(key !== null && key !== undefined){
      AsyncStorage.removeItem(key);
      tempDirectories = directories;
      const directoryIndex = tempDirectories.findIndex((e) => e.key == key);
      closeDirectory(directories[directoryIndex]);
      tempDirectories.splice(directoryIndex, 1);
      setDirectories(tempDirectories);
    }
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function toggleTask(child){
    console.log("Toggle: ", child.name, " : ", child.isComplete);
    let tempDirectory;
    if(child.parentKey.constructor === Array){ // Checks if is a nested item
      tempDirectory = directories.find((e) => e.key == child.parentKey[3]);

      const nestIndex = tempDirectory.children.findIndex((e) => e.name == child.parentKey[0] && e.order == child.parentKey[1]);
      const childIndex = tempDirectory.children[nestIndex].children.findIndex((e) => e == child);
      tempDirectory.children[nestIndex].children[childIndex].isComplete = !child.isComplete;
    }
    else{
      tempDirectory = directories.find((e) => e.key == child.parentKey);
      const index = tempDirectory.children.findIndex((e) => e == child);
      tempDirectory.children[index].isComplete = !child.isComplete;
    }
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

  function displayButton(title, onPress){
    return(
      <Pressable style={styles.button} onPress={() => onPress()}>
        <Text style={styles.inputText}>{title}</Text>
      </Pressable>
    );
  }

  // Display Directory
  function displayDirectory(directory){ // Displays directories at top
    return(
      <View style={styles.directory}>
        <View style={styles.header}>
          {directory.parentKey == '' && displayButton('Settings', () => setModalView('Settings'))}
          {directory.parentKey !== directories[0].key && directory.parentKey !== '' && displayButton('Exit', () => setModalView(null))}
          {directory.parentKey !== ''  && displayButton('Back', () => closeDirectory(directory))}
            <Pressable style={styles.headerMiddle} onPress={() => {setBooleanInput(directory.showCompleted); setUpdateItem([directory.name, directory.order, directory.parentKey, directory.type])}}>
              <Text style={styles.headerText}>{directory.name}</Text>
            </Pressable>
          {displayButton('Add', () => {setDropdownInput({type: 'Task'}); setAddItem(directory.key)})}
        </View>
        {addItem !== null && addItem.constructor !== Array && displayAddForm(true)}
        {updateItem !== null && updateItem[0] == directory.name && updateItem[1] == directory.order &&  updateItem[2] == directory.parentKey && displayUpdateDirectory(directory)}
        <ScrollView style={styles.children}>
          {displayChildren(directory.children, directory.showCompleted)}
        </ScrollView>
      </View>
    );
  }
  function displayUpdateDirectory(directory){
    return(
      <View>
        {displayButton('Back', () => clearInputs())}
        {directory.parentKey !== '' && 
        <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name to Update'/>}
        <Text style={styles.text}>Display completed tasks?</Text>
        <Checkbox value={booleanInput} onValueChange={setBooleanInput}/>
        {displayButton('Update', () => updateChildCheck(directory, nameInput, numberInput, colorInput, imageInput, booleanInput))}
          {directory.parentKey !== '' &&  displayButton('Delete', () => setDeleteItem([directory.name, directory.order, directory.parentKey]))}
          {deleteItem !== null && deleteItem[0] == directory.name && deleteItem[1] == directory.order && deleteItem[2] == directory.parentKey && displayDeleteChildForm(directory, directory.key)}
      </View>
    );
  }
  function displaySettings(){
    return (
      <ScrollView>
        {displayButton('Back', () => setModalView(null))}
        <Text style={styles.text}>Settings</Text>
        <Text style={styles.text}>{errorMessage}</Text>
        <Text style={styles.text}>Theme:      </Text>
        <Dropdown style={styles.dropdown} data={themes} labelField='theme' valueField='theme' value={dropdownInput} onChange={setDropdownInput}/>
        </ScrollView>
    );
  }
  function openDirectory(child){
    setUpdateItem(null);

    let tempDirectories = directories;
    tempDirectories.push(child);
    setDirectories(tempDirectories);
    console.log("Open: ", child.name);
    const value = AsyncStorage.getItem(child.key).then((value) => {
      if(value !== null){
        tempDirectories = directories;
        const index = tempDirectories.findIndex((e) => e.key == child.key);
        tempDirectories[index] = JSON.parse(value);
        console.log(JSON.parse(value).name, ' : ', JSON.parse(value).showCompleted);
        setDirectories(tempDirectories);
      }
      setModalView(directories.findIndex((e) => e.key == child.key));
    });
  }
  function closeDirectory(child){
    setUpdateItem(null);
    if(child.parentKey == directories[0].key){
      setModalView(null);
    }
    else{
      setModalView(directories.findIndex((e) => e.key == child.parentKey));
    }
  }
  // directories Forms
  function displayAddForm(isDirectory){ // Displays add child form
    if(addItem !== null){
      let key;
      let order;
      if(!isDirectory){ // Checks if you are adding to a Nested item or directory
        key = addItem;
        order = addItem[2];
      }
      else{
        key = addItem;
        order = directories.find((e) => e.key == addItem).children.length;
      }
      return(
        <View>
          <Text style={styles.text}>{errorMessage}</Text>
            <Text style={styles.text}>Add Name: </Text>
            <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name'/>
            <Text style={styles.text}>Add Color: </Text>
            <TextInput style={styles.textInput} onChangeText={setColorInput} value={colorInput} placeholder='Enter Color'/>
            {isDirectory == true && <Dropdown style={styles.dropdown} data={childTypes} labelField='type' valueField='type' value={dropdownInput} onChange={setDropdownInput}/>}
            {dropdownInput !== null && dropdownInput.type == 'Image' && displayButton('Pick an image from gallery', () => pickImage())}
            {displayButton('Submit', () => addChildCheck(key, nameInput, order, dropdownInput.type, colorInput, imageInput))}
            {displayButton('Cancel', () => {clearInputs(); setAddItem(null)})}
        </View>
    );
    }
  }
// Display Children
  function displayChildren(children, showCompleted){ // Displays children of directories
    return children.map((child) => {
      switch(child.type){
        case 'Task':
          return displayTask(child, showCompleted);
        case 'Note':
          return displayNote(child);
        case 'Image':
          return displayImage(child);
        case 'Nested Tasks':
          return displayNestedTasks(child);
        case 'Nested Images':
          return displayNestedImages(child);
        case 'Directory':
          return displayChildDirectory(child);
      }
    });
  }
  function displayTask(child, showCompleted){
    if(child.isComplete == false || child.isComplete == true && showCompleted){
      return (
        <View key={child.name+child.order} style={styles.child}>
          <Text style={styles.text}>{child.name}</Text>
          <Text style={styles.text}>{JSON.stringify(child.isComplete)}</Text>
          {displayButton('Complete', () => {toggleTask(child); setErrorMessage('Refresh');})}
          {(updateItem == null || updateItem[0] !== child.name || updateItem[1] !== child.order || updateItem[2] !== child.parentKey) &&  displayButton('Update', () => setUpdateItem([child.name, child.order, child.parentKey]))}  
          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}
        </View>
      );
    }
  }
  function displayNote(child){
    if(expandItems.length == 0 || expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) == -1){
      return (
        <View key={child.name+child.order} style={styles.child}>  
          <Pressable onPress={() => {setTextInput(child.text); expandChild(child)}}>
            <Text style={styles.text}>{child.name}</Text>
            <Text style={styles.text}>{child.type}</Text>
            <Text multiline={false} style={styles.text}>{child.text}</Text>
          </Pressable>
        </View>
      );
    }
    else{
      return displayNoteForm(child);
    }
  }
  function displayImage(child){
    return (
      <View key={child.name+child.order} style={styles.child}>
        <Pressable onPress={() => expandChild(child)}>
          <Text style={styles.text}>{child.name}</Text>
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 &&
          displayButton('Back', () => {setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name));
           if(updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey){setUpdateItem(null)}})}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) == -1 && 
            <Image style={styles.miniPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 && 
            <Image style={styles.fullPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 &&(updateItem == null || updateItem[0] !== child.name || updateItem[1] !== child.order || updateItem[2] !== child.parentKey) &&  displayButton('Update', () => setUpdateItem([child.name, child.order, child.parentKey]))}  

        </Pressable>
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
        {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}
      </View>
    );
  }
  function displayNestedTasks(child){
    if(child.children.length > 0 && !child.isComplete && child.children.findIndex((e) => e.isComplete == false) == -1){
      toggleTask(child);
    }
    else if(child.children.length == 0 && child.isComplete  || child.children.length > 0 && child.isComplete && child.children.findIndex((e) => e.isComplete == false) > -1){
      toggleTask(child);
    }
    return(
      <View key={child.name + child.order} style={styles.child}>
        <Pressable onPress={() => {expandChild(child)}}>
            <Text style={styles.text}>{child.name}</Text>
            <Text style={styles.text}>{child.type}</Text>
            <Text style={styles.text}>{JSON.stringify(child.isComplete)}</Text>
          </Pressable>
          {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && addItem[3] == child.parentKey && displayAddForm(false)}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && displayExpandedNest(child)}
      </View>
    );
  }
  function displayNestedImages(child){
    return(
      <View key={child.name + child.order} style={styles.child}>
        <Pressable onPress={() => {expandChild(child)}}>
            <Text style={styles.text}>{child.name}</Text>
            <Text style={styles.text}>{child.type}</Text>
          </Pressable>
          {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && addItem[3] == child.parentKey && displayAddForm(false)}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && displayExpandedNest(child)}
      </View>
    );
  }
  function displayExpandedNest(child){
    return(
      <View style={styles.nested}>
        {displayButton('Back', () => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name || e.parentKey !== child.parentKey)))}
        {displayButton('Add', () => {clearInputs(); setAddItem([child.name, child.order, child.children.length, child.parentKey]); setDropdownInput({type: 'Task'})})}

        {(updateItem == null || updateItem[0] !== child.name || updateItem[1] !== child.order || updateItem[2] !== child.parentKey) &&  displayButton('Update', () => setUpdateItem([child.name, child.order, child.parentKey]))}
        {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}
        {displayButton('Delete', () => setDeleteItem([child.name, child.order, child.parentKey]))}
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
        {displayChildren(child.children)}
    </View>
    );
  }
  function displayChildDirectory(child){
    return (
      <View key={child.name+child.order} style={styles.child}>
        <Pressable onPress={() => openDirectory(child)}>
          <Text style={styles.text}>{child.name}</Text>
          <Text style={styles.text}>{child.type}</Text>
        </Pressable>
      </View>
    );
  }
  // Child Forms
  function displayNoteForm(child){
    return(
      <View key={child.name+child.order} style={styles.child}>  
        {displayButton('Back', () => {clearInputs(); setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))})}
        <Text style={styles.text}>{child.name}</Text>
        <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder={child.name}/>
        {displayButton('Update', () => {updateChildCheck(child, nameInput); setTextInput(child.text); setUpdateItem([child.name, child.order, child.parentKey, child.type])})}
        {displayButton('Delete', () => setDeleteItem([child.name, child.order]))}
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
        <TextInput style={styles.textInput} value={textInput} onChangeText={setTextInput} multiline={true} placeholder='Enter Note Here'/>
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
      <View style={styles.form}>
        <Text style={styles.text}>Update {child.name}</Text>
        <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Updated Name'/>
        <TextInput style={styles.textInput} value={numberInput} onChangeText={setNumberInput} keyboardType='numeric'placeholder='Enter Updated Order #'/>
        <TextInput style={styles.textInput} value={colorInput} onChangeText={setColorInput} placeholder='Enter Updated Color'/>
        {displayButton('Submit', () => updateChildCheck(child, nameInput, tempNum, colorInput, imageInput))}
        {child.type == 'Image' && displayButton('Pick an image from gallery', () => pickImage())}
        {displayButton('Cancel', () => clearInputs())}
        {displayButton('Delete', () => setDeleteItem([child.name, child.order, child.parentKey]))}
      </View>
    );
  }
  function displayDeleteChildForm(child, key){ // Displays item delete form
    return(
      <View>
        <Text style={styles.text}>Delete {child.name}?</Text>
        {displayButton('Confirm', () => deleteChild(child.name, child.order, child.parentKey, key))}
        {displayButton('Cancel', () => {if(updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order){setDeleteItem(null)}else{clearInputs()}})}
      </View>
    );
  }

  const theme = themes.find((e) => e.theme == settings.theme);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      alignItems: 'center',
      width: '100%',
      alignSelf: 'stretch',
    },
    modalView: {
      width: '88%',
      height: '96%',
      margin: 12,
      alignSelf: 'center',
      backgroundColor: theme.modalBackgroundColor,
      borderRadius: theme.borderRadius,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    directory: {
      borderRadius: theme.borderRadius,
      alignItems: 'center',
      width: '96%',
    },
    form: {
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      paddingHorizontal: 6,
      paddingVertical: 4,
      marginVertical: 2,
    },

    text: {
      color: theme.textColor,
      fontSize: theme.fontSize,
    },
    headerText: {
      color: theme.inputTextColor,
      fontSize: theme.headerFontSize,
    },
    inputText: {
      color: theme.inputTextColor,
      fontSize: theme.inputFontSize
    },
    textInput: {
      fontSize: theme.fontSize,
      color: theme.inputTextColor,
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      backgroundColor: theme.inputBackgroundColor,
      borderRadius: theme.borderRadius,
      padding: 2,
      paddingHorizontal: 6,
      margin: 2,
    },
    button: {
      fontSize: theme.fontSize,
      color: theme.inputTextColor,
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      padding: 8,
      backgroundColor: theme.inputBackgroundColor,
      margin: 2,
    },
    dropdown: {
      fontSize: theme.fontSize,
      color: theme.inputTextColor,
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      padding: 4,
      backgroundColor: theme.inputBackgroundColor,
    },

    header: {
      display: 'flex', 
      flexDirection: 'row',
      backgroundColor: this.color,
      paddingTop: 40,
      width: '88%',
      alignItems: 'center',
      paddingBottom: 4,
    },
    headerLeft: {
        position: 'relative',
        left: 0,
        alignItems: 'flex-start',
        justifySelf: 'flex-start', 
        paddingRight: 10,
    },
    headerMiddle: {
        flexDirection: 'column',
        marginLeft: 4,
        marginRight: 4,
    },
    headerRight: {
        justifySelf: 'right',
        alignItems: 'right',
        right: 0,
        paddingLeft: 10,
    },

    children: {
      backgroundColor: theme.childrenBackgroundColor,
      borderRadius: theme.borderRadius,
      paddingTop: 8,
      padding: 4,
      width: '88%',
      height: '84%'
    },
    child: {
      padding: 8,
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      backgroundColor: theme.itemBackgroundColor,
      marginVertical: 4,
      marginHorizontal: 4,
    },
    nested: {
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      backgroundColor: theme.nestBackgroundColor,
      marginBottom: 4,
      marginHorizontal: 4,
    },
    NoteTextPrev: {
      height: 16,
    },
    miniPic: {
      height: 100,
      borderRadius: theme.borderRadius,
    },
    fullPic: { 
      height: 260,
      borderRadius: 0,

    },
  
  });

  if(directories !== null){ // Displays directories if not null
    return (
      <View style={styles.container}>
        {displayDirectory(directories[0])}

        <Modal
          animationType='slide'
          transparent={true}
          visible={modalView !== null}
          onRequestClose={() => {
            console.log("Modal Closed");
            setModalView(null);
          }}>
            <View style={styles.modalView}>
              {modalView !== null && modalView == 'Settings' && displaySettings()}
              {modalView !== null && modalView !== 'Settings' && directories[modalView] !== null && displayDirectory(directories[modalView])}
            </View>

        </Modal>
      </View>
    );
  }
}