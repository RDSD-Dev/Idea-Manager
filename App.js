import { StatusBar } from 'expo-status-bar';
import {TextInput, Button, StyleSheet, Text, View, ScrollView , Pressable, Image, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';

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

  const childTypes = [
    {type: 'Task'},
    {type: 'Note'},
    {type: 'Image'},
    {type: 'Nested Tasks'},
    {type: 'Nested Images'},
    {type: 'Directory'}
  ]

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
        let temp = {name: 'Idea Manager', order: 0, parentKey: '', color: 'Grey', key: 'Idea Manager', children: []};
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
      console.log("Temp: ", tempDirectory.children);
    }
    saveDirectory(tempDirectory);
    clearInputs();
  }
  function updateChild(child, updateName, updateOrder, updateColor, updateImage){
    const oldOrder = child.order;
    console.log("Update: ", child.name, updateOrder, child.order);
    let updateChild = child;

    updateChild.name = updateName;
    updateChild.order = updateOrder;
    updateChild.color = updateColor;
    if(updateImage !== null){
      updateChild.image = updateImage; 
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
      tempDirectory = directories.find((e) => e.key == updateChild.parentKey);
      tempChildren = tempDirectory.children;
    }

    const index = tempChildren.findIndex((e) => e.name == child.name && e.order == child.order);
    tempChildren[index] = updateChild;

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

    if(nestIndex > -1){
      tempDirectory.children[nestIndex].children = tempChildren;
    }
    else{
      tempDirectory.children = tempChildren;
    }

    saveDirectory(tempDirectory);
    clearInputs();
  }
  function deleteChild(name, order, parentKey){ // Deletes Child
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

  function displayDirectory(directory){ // Displays directories at top
    return(
      <View>
        <View style={styles.header}>
          {directory.parentKey == '' && <Button title='Settings' onPress={() => setModalView('Settings')} />}
          {directory.parentKey !== ''  && <Button title='Back' onPress={() => setModalView(null)}/>}
          <Text style={styles.headerMiddle}>{directory.name}</Text>
          <Button title="Add" style={styles.headerRight} onPress={() => {setDropdownInput({type: 'Task'}); setAddItem(directory.key)}} />
        </View>
        {addItem !== null && addItem.constructor !== Array && displayAddForm(true)}
        <ScrollView>
          {displayChildren(directory.children)}
        </ScrollView>
      </View>
    );
  }
  function displaySettings(){
    return (
      <ScrollView>
        <Button title='Back' onPress={() => setModalView(null)}/>
        <Text>Settings</Text>
      </ScrollView>
    );
  }
  function openDirectory(child){
    let tempDirectories = directories;
    tempDirectories.push(child);
    setDirectories(tempDirectories);
    console.log("Open: ", child.name);
    const value = AsyncStorage.getItem(child.key).then((value) => {
      if(value !== null){
        tempDirectories = directories;
        const index = tempDirectories.findIndex((e) => e.key == child.key);
        tempDirectories[index] = JSON.parse(value);
        setDirectories(tempDirectories);
      }
      setModalView(directories.findIndex((e) => e.key == child.key));
    });
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
        console.log("Add: ", addItem, " : ", directories.length);
        order = directories.find((e) => e.key == addItem).children.length;
      }
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
  function displayChildren(children){ // Displays children of directories
    return children.map((child) => {
      switch(child.type){
        case 'Task':
          return displayTask(child);
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
  function displayTask(child){
    return (
      <View key={child.name+child.order} style={child.style}>
        <Text>{child.name}</Text>
        <Text>{JSON.stringify(child.isComplete)}</Text>
        <Button title='Complete' onPress={() => {toggleTask(child); setErrorMessage('Refresh');}}/>
        <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order, child.parentKey])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>

          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}
      </View>
    );
  }
  function displayNote(child){
    if(expandItems.length == 0 || expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) == -1){
      return (
        <View key={child.name+child.order} style={child.style}>  
          <Pressable onPress={() => {setTextInput(child.text); expandChild(child)}}>
            <Text>{child.name}</Text>
            <Text>{child.type}</Text>
            <Text multiline={false} style={styles.NoteTextPrev}>{child.text}</Text>
          </Pressable>
          <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>
  
            {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
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
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 &&
            <Button title='Back' onPress={() => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) == -1 && 
            <Image style={styles.miniPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 && 
            <Image style={styles.fullPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}
        </Pressable>
        <Button title='Update' onPress={() => {setUpdateItem([child.name, child.order, child.parentKey])}}/>
        <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>

          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateImageForm(child)}
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
      <View key={child.name + child.order} style={child.style}>
        <Pressable onPress={() => {expandChild(child)}}>
            <Text>{child.name}</Text>
            <Text>{child.type}</Text>
            <Text>{JSON.stringify(child.isComplete)}</Text>
          </Pressable>
          {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && addItem[3] == child.parentKey && displayAddForm(false)}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && 
            <View>
              <Text>{child.parentKey}</Text>
              <Button title='Back' onPress={() => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name || e.parentKey !== child.parentKey))}/>
              <Button title='Add' onPress={() => {clearInputs(); setAddItem([child.name, child.order, child.children.length, child.parentKey]); setDropdownInput({type: 'Task'})}}/>
              <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>
              {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
              {displayChildren(child.children)}
            </View>}
      </View>
    );
  }
  function displayNestedImages(child){
    return(
      <View key={child.name + child.order} style={child.style}>
        <Pressable onPress={() => {expandChild(child)}}>
            <Text>{child.name}</Text>
            <Text>{child.type}</Text>
          </Pressable>
          {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && addItem[3] == child.parentKey && displayAddForm(false)}
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && 
            <View>
              <Button title='Back' onPress={() => setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}/>
              <Button title='Add' onPress={() => {clearInputs(); setAddItem([child.name, child.order, child.children.length, child.parentKey]); setDropdownInput({type: 'Image'})}}/>
              <Button title='Delete' onPress={() => {setDeleteItem([child.name, child.order, child.parentKey])}}/>
              {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
              {displayChildren(child.children)}
            </View>}
      </View>
    );
  }
  function displayChildDirectory(child){
    return (
      <View key={child.name+child.order} style={child.style}>
        <Pressable onPress={() => openDirectory(child)}>
          <Text>{child.name}</Text>
          <Text>{child.type}</Text>
        </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
  },
  nestedImages: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'yellow',
    marginBottom: 4,
    width: '80vw',
  },

});
