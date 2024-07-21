import {TextInput, StyleSheet, Text, View, ScrollView , Pressable, Image, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import {decodeEntity, decode} from 'html-entities';

export default function App() {
  const [modalView, setModalView] = useState(null);
  const [directories, setDirectories] = useState(null); // name, order#, parentKey, color, key, children[]
  const [addItem, setAddItem] = useState(null);
  const [updateItem, setUpdateItem] = useState(null); // Stores [name, order]
  const [moveItem, setMoveItem] = useState(null); // Stores [name, order, moveObj]
  const [deleteItem, setDeleteItem] = useState(null); // Stores [name, order]
  const [expandItems, setExpandedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState(null);
  const [moveInput, setMoveInput] = useState(null);
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
      borderColor: '#000000',borderWidth: 2, borderStyle: 'solid', fontSize: 16, symbolSize: 32, headerFontSize: 20, inputFontSize: 18, borderRadius: 20}
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
  const icons = {
    Gear: decodeEntity('&#9881;'),
    Pencil: decodeEntity('&#9998;'),
    Circle: decode('&#9675;'),
    FilledCircle: decode('&#9673;'),
    Diamond: decode('&#9671;'),
    FilledDiamond: decode('&#9672;'),
    Triangle: decode('&#9651;'),
    FilledTriangle: decode('&#9650;'),
    DashedSquare: decode('&#9636;'),
    Enter: decodeEntity('&#8619;'),
    Left: decodeEntity('&#8592;'),
    DoubleLeft: decodeEntity('&#8606;'),
    UpDown: decodeEntity('&#8597;'),
    Trash: decodeEntity('&#x1F5D1;'),
    Image: decodeEntity('&#9783;'),
  };
  const colors = [
    {label: 'Light Blue',value: '#04A6E5'}, {label: 'Forest Green', value: '#045C34'}, {label: 'Grey', value: '#7C7C7C'},
    {label: 'Red', value: '#EC161D'}
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
        let temp = {name: 'Idea Manager', order: 0, parentKey: '', color: 'Grey', key: 'Idea Manager', children: [], showCompleted: true, moveable: [{name: 'Idea Manager', order: 0, type: 'Directory', key: 'Idea Manager'}]};
        setDirectories([temp]);
        AsyncStorage.setItem(temp.key, JSON.stringify(temp));
      }
    });
  }

  function clearInputs(){ // Clears all inputs
    console.log("Clear");
    setAddItem(null);
    setUpdateItem(null);
    setMoveItem(null);
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

  // Directory Functions
  function saveDirectory(saveDirectory){
    let tempDirectories = directories;
    let index = directories.findIndex((e) => e.key == saveDirectory.key);
    tempDirectories[index] = saveDirectory;
    setDirectories(tempDirectories);
    AsyncStorage.setItem(saveDirectory.key, JSON.stringify(saveDirectory));
  }
  function openDirectory(child){
    setUpdateItem(null);
    let tempDirectories = directories;
    if(tempDirectories.findIndex((e) => e.key == child.key) == -1){ // Directory already exists
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
      });
    }
    
    setModalView(directories.findIndex((e) => e.key == child.key));
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
  function sortChildren(children){
    console.log("Sort children");
    let tempChildren = [];
    for(let i=0; i<children.length; i++){
      tempChildren.push(children[children.findIndex((e) => e.order == i)]);
    }
    return tempChildren;
  }

  // Child Functions
  function toggleTask(child){Button
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
  function expandChild(child){
      if(child.type == 'Note' && expandItems.findIndex((e) => e.type == 'Note') > -1){
        setExpandedItems(expandItems.filter((e) => e.type !== 'Note'));
      }
      setExpandedItems(expandItems => [...expandItems, {name: child.name, order: child.order, type: child.type, parentKey: child.parentKey}])
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
  function addChildCheck(parentKey, name, order, type, color, image, text){ // Checks if the child is valid
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
        addChild(parentKey, name, order, type, color, image, text);
        return;
      }
  }
  function addChild(parentKey, name, order, type, color, image, text){ // Makes child object and makes sure it is saved
      console.log("add: ", name, " : ", type, " To : ", parentKey);
      let tempMoveable;
      let newChild = {name: name, order: order, parentKey: parentKey, color: color, type: type, isNested: false};
      switch(type){
        case "Task":
          newChild.style = styles.Task;
          newChild.isComplete = false;
          break;
        case "Note":
          newChild.style = styles.Note;
          newChild.text = text;
          break;
        case 'Image':
          newChild.style = styles.Picture;
          newChild.image = image;
          break;
        case 'Nested Tasks':
          tempMoveable = {name: name, type: type, order: order};
          newChild.style = styles.nestedTasks;
          newChild.isComplete = false;
          newChild.showCompleted = true;
          newChild.children = [];
          break;
        case 'Nested Images':
          tempMoveable = {name: name, type: type, order: order};
          newChild.style = styles.nestedImages;
          newChild.children = [];
          break;
        case 'Directory':
          tempMoveable = {name: name, type: type, order: order, parentKey: parentKey};
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
        if(tempMoveable !== undefined){
          tempDirectory.moveable.push(tempMoveable);
        }
      }
      saveDirectory(tempDirectory);
      clearInputs();
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
  
      if(child.type == 'Directory' || child.type == 'Nested Tasks' || child.type == 'Nested Images'){
        const moveIndex = tempDirectory.moveable.findIndex((e) => e.name == oldName && e.order == oldOrder);
        tempDirectory.moveable[moveIndex].name = updateName;
        tempDirectory.moveable[moveIndex].order = updateOrder;
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
      if(child.type == 'Directory' || child.type == 'Nested Tasks' || child.type == 'Nested Images'){
        const moveIndex = tempDirectory.moveable.findIndex((e) => e.name == name && e.order == order);
        tempDirectory.moveable.splice(moveIndex, 1);
      }
  
      saveDirectory(tempDirectory);
      clearInputs();
  }
  function moveChildCheck(name, order, moveTo){
    
  }
  function moveChild(name, order, moveTo){
      console.log('Move ', name, ' To ', moveTo.name);
      clearInputs();
  }

  // Display Directory Functions
  function displayDirectory(directory){ // Displays directories at top
    return(
      <View style={styles.directory}>
        <View style={styles.header}>
          {directory.parentKey == '' && displayButton(icons.Gear, () => {setDropdownInput(theme); setModalView('Settings')})/* Settings Btn */}

          {directory.parentKey !== directories[0].key && directory.parentKey !== '' && <View style={styles.headerBack}>{displayButton(icons.Left, () => closeDirectory(directory))}{displayButton(icons.DoubleLeft, () => setModalView(null))}</View> /* Exit Btn */}

          {directory.parentKey !== ''  && directory.parentKey == directories[0].key &&  displayButton(icons.Left, () => closeDirectory(directory))/* Back Btn */}
            <Pressable style={styles.headerMiddle} onPress={() => {setBooleanInput(directory.showCompleted); setNameInput(directory.name); setColorInput(directory.color); setUpdateItem([directory.name, directory.order, directory.parentKey, directory.type])}}>
              <Text style={styles.headerText}>{directory.name}</Text>
            </Pressable>
          {displayButton(decodeEntity('&#43;'), () => {setDropdownInput({type: 'Task'}); setColorInput(colors[0]); setAddItem(directory.key)}) /* Add Btn */}
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
    const color = directory.color.value;
    return(
      <View style={styles.form}>
        <View style={styles.formBtns}>
        {displayButton(icons.Left, () => clearInputs()) /* Back Btn */}
        {!directory.showCompleted && <Pressable onPress={() => {setBooleanInput(!booleanInput); updateChildCheck(directory, null, null, null, null, true); setNameInput(directory.name); setColorInput(directory.color); setUpdateItem([directory.name, directory.order, directory.parentKey, directory.type])}}><Text style={[styles.symbol, {color: color}]}>{icons.Circle}</Text></Pressable>}
        {directory.showCompleted && <Pressable onPress={() => {setBooleanInput(!booleanInput); updateChildCheck(directory, null, null, null, null, false); setNameInput(directory.name); setColorInput(directory.color); setUpdateItem([directory.name, directory.order, directory.parentKey, directory.type])}}><Text style={[styles.symbol, {color: color}]}>{icons.FilledCircle}</Text></Pressable>}
        {directory.parentKey !== '' &&  displayButton(icons.Trash, () => setDeleteItem([directory.name, directory.order, directory.parentKey])) /* Delete Btn */}
        </View>
        {directory.parentKey !== '' && 
        <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name to Update'/>}
          {directory.parentKey !== '' &&
          <Dropdown style={styles.dropdown} data={colors} labelField='label' valueField='value' value={colorInput} onChange={setColorInput}/>}
        {displayButton('Submit', () => updateChildCheck(directory, nameInput, numberInput, colorInput, imageInput, booleanInput))}
          {deleteItem !== null && deleteItem[0] == directory.name && deleteItem[1] == directory.order && deleteItem[2] == directory.parentKey && displayDeleteChildForm(directory, directory.key)}
      </View>
    );
  }

  // Display Form Functions
  function displaySettings(){
    return (
      <ScrollView contentContainerStyle={styles.settings}>
        <View style={styles.header}>
          {displayButton('Back', () => setModalView(null))}
          <Text style={styles.text}>Settings</Text>
          {displayButton(decodeEntity('&#x1F5D1;'), () => setModalView(null))}
        </View>
        <Text style={styles.text}>{errorMessage}</Text>
        <Text style={styles.text}>Theme:      </Text>
        <Dropdown style={styles.dropdown} data={themes} labelField='theme' valueField='theme' value={dropdownInput} onChange={setDropdownInput}/>
        </ScrollView>
    );
  }
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
      <View style={styles.form} >
          <Text style={styles.text}>{errorMessage}</Text>
            <Text style={styles.text}>Add Name: </Text>
            <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder='Enter Name'/>

            <Text style={styles.text}>Select Color</Text>
            <Dropdown style={styles.dropdown} data={colors} labelField='label' valueField='value' value={colorInput} onChange={setColorInput}/>
            {isDirectory == true && <Text style={styles.text}>Select Type</Text>}
            {isDirectory == true && <Dropdown style={styles.dropdown} data={childTypes} labelField='type' valueField='type' value={dropdownInput} onChange={setDropdownInput}/>}

            {dropdownInput !== null && dropdownInput.type == 'Note' && <TextInput multiline={true} style={styles.textInput} placeholder='Enter Note Here' value={textInput} onChangeText={setTextInput}/>}

            <View style={styles.formBtns}>
              {displayButton('Submit', () => addChildCheck(key, nameInput, order, dropdownInput.type, colorInput, imageInput, textInput))}
              {dropdownInput !== null && dropdownInput.type == 'Image' && displayButton(icons.Image, () => pickImage())}
              {displayButton('Cancel', () => {clearInputs(); setAddItem(null)})}
            </View>
        </View>
    );
    }
  }
  function displayUpdateChildForm(child, displayDelete, displayMove){ // Displays item update form
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
        <Text style={styles.text}>Select Color</Text>
        <Dropdown style={styles.dropdown} data={colors} labelField='label' valueField='value' value={colorInput} onChange={setColorInput}/>
        <View style={styles.formBtns}>
          {displayButton('Submit', () => updateChildCheck(child, nameInput, tempNum, colorInput, imageInput))}
          {displayMove && displayButton('Move', () => {clearInputs(); setMoveItem([child.name, child.order, child.parentKey])})}
          {child.type == 'Image' && displayButton(icons.Image, () => pickImage())}

          {displayButton('Cancel', () => clearInputs())}
          {displayDelete &&  displayButton(icons.Trash, () => setDeleteItem([child.name, child.order, child.parentKey])) /* Delete Btn */}
        </View>
      </View>
    );
  }
  function displayMoveChildForm(child){
    let index;
    let moveOptions;
    if(child.parentKey.constructor !== Array){
      index = directories.findIndex((e) => e.key == child.parentKey);
      moveOptions =  directories[index].moveable.filter((e) => e.key !== child.parentKey);
    }
    else{
      index = directories.findIndex((e) => e.key == child.parentKey[3]);
      moveOptions = directories[index].moveable.filter((e) => e.parentKey !== child.parentKey[3] && e.name !== child.parentKey[0] && e.order !== child.parentKey[1]);
    }

    if(moveOptions.length > 0 && child.type !== 'Task' && child.type !== 'Image'){
      moveOptions = moveOptions.filter((e) => e.type == 'Directory');
    }
    else if(moveOptions.length > 0 && child.type == 'Task'){
      moveOptions = moveOptions.filter((e) => e.type !== 'Nested Images');
    }
    else if(moveOptions.length > 0 && child.type == 'Image'){
      moveOptions = moveOptions.filter((e) => e.type !== 'Nested Tasks');
    }
    return(
      <View style={styles.form}>
        <Text style={styles.text}>Select where to move the item</Text>
        <Dropdown style={styles.dropdown} data={moveOptions} labelField='name' valueField='name' value={moveInput} onChange={setMoveInput} />
        <View style={styles.formBtns}>
          {displayButton('Submit', () => moveChildCheck(child.name, child.order, moveInput))}
          {displayButton('Cancel', () => clearInputs())}
        </View>
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
  function displayButton(title, onPress){
    return(
      <Pressable style={styles.button} onPress={() => onPress()}>
        <Text style={styles.inputText}>{title}</Text>
      </Pressable>
    );
  }

// Display Children Functions
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
      const color = child.color.value;
      return (
        <View key={child.name+child.order} style={styles.child}>
          <View style={styles.task}>
            {!child.isComplete && <Pressable onPress={() => {toggleTask(child); setErrorMessage('Refresh');}}><Text style={[styles.symbol, {color: color}]}>{icons.Circle}</Text></Pressable>}
            {child.isComplete && <Pressable onPress={() => {toggleTask(child); setErrorMessage('Refresh');}}><Text style={[styles.symbol, {color: color}]}>{icons.FilledCircle}</Text></Pressable>}
            <Pressable onPress={() => {setColorInput(child.color); setUpdateItem([child.name, child.order, child.parentKey])}}>
              <Text numberOfLines={1} ellipsizeMode='tail' style={styles.text}>{child.name}</Text>
            </Pressable>
          </View>
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child, true, true)}
          {moveItem !== null && moveItem[0] == child.name && moveItem[1] == child.order && moveItem[2] == child.parentKey && displayMoveChildForm(child)}
          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
        </View>
      );
    }
  }
  function displayNote(child){
    if(expandItems.length == 0 || expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) == -1){
      const color = child.color.value;
      return (
        <View key={child.name+child.order} style={styles.child}>  
          <Pressable onPress={() => {setNameInput(child.name); setTextInput(child.text); setColorInput(child.color); expandChild(child)}}>
            <View style={styles.task}>
              <Text style={[styles.symbol, {color: color}]}>{icons.DashedSquare}</Text>
              <Text style={styles.text}>{child.name}</Text>
            </View>
            <Text numberOfLines={2} ellipsizeMode='tail' style={[styles.text, styles.NotePreview]}>{child.text}</Text>
          </Pressable>
        </View>
      );
    }
    else{
      return displayNoteForm(child);
    }
  }
  function displayNoteForm(child){
    return(
      <View key={child.name+child.order} style={styles.child}>  
        <TextInput style={styles.textInput} value={nameInput} onChangeText={setNameInput} placeholder={child.name}/>
        <Dropdown style={styles.dropdown} data={colors} labelField='label' valueField='value' value={colorInput} onChange={setColorInput}/>
        <View style={styles.formBtns}>
          {displayButton(icons.Left, () => {clearInputs(); setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name))}) /* Back Btn */}
          {displayButton('Update', () => {updateChildCheck(child, nameInput, child.order, colorInput); setTextInput(child.text); setUpdateItem([child.name, child.order, child.parentKey, child.type])})}
          {displayButton(icons.Trash, () => setDeleteItem([child.name, child.order])) /* Delete btn */ }
        </View>
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && displayDeleteChildForm(child)}
        <TextInput style={styles.textInput} value={textInput} onChangeText={setTextInput} multiline={true} placeholder='Enter Note Here'/>
      </View>
    );
  }
  function displayImage(child){
    const color = child.color.value;
    return (
      <View key={child.name+child.order} style={styles.child}>
        <Pressable onPress={() => expandChild(child)}>
          <View style={styles.task}>
            <Text style={[styles.symbol, {color: color}]}>{icons.Triangle}</Text>
            <Text style={styles.text}>{child.name}</Text>
          </View>
          <View style={styles.formBtns}>
            {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 &&
            displayButton(icons.Left, () => {clearInputs(); setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name)); clearInputs();}) /* Back Btn */}
            {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 &&(updateItem == null || updateItem[0] !== child.name || updateItem[1] !== child.order || updateItem[2] !== child.parentKey) &&  displayButton('Update', () => {clearInputs(); setColorInput(child.color); setNameInput(child.name);  setUpdateItem([child.name, child.order, child.parentKey])})}  
            {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && displayButton(icons.Trash, () => setDeleteItem([child.name, child.order, child.parentKey]))}
          </View>
          {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
          {moveItem !== null && moveItem[0] == child.name && moveItem[1] == child.order && moveItem[2] == child.parentKey && displayMoveChildForm(child)}
          {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}

          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order) !== -1 && 
            <Image style={styles.fullPic} source={child.image.assets} alt='The image was either moved or deleted from your device.'/>}

        </Pressable>
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
    const color = child.color.value;
    return(
      <View key={child.name + child.order} style={styles.child}>
        <Pressable onPress={() => {setBooleanInput(child.showCompleted); expandChild(child)}}>
          <View style={styles.task}>
              {!child.isComplete && <Text style={[styles.symbol, {color: color}]}>{icons.Diamond}</Text>}
              {child.isComplete && <Text style={[styles.symbol, {color: color}]}>{icons.FilledDiamond}</Text>}

              <Text style={styles.text}>{child.name}</Text>
            </View>
          </Pressable>
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && displayExpandedNest(child)}
      </View>
    );
  }
  function displayNestedImages(child){
    const color = child.color.value;
    return(
      <View key={child.name + child.order} style={styles.child}>
        <Pressable onPress={() => {expandChild(child)}}>
          <View style={styles.task}>
            <Text style={[styles.symbol, {color: color}]}>{icons.FilledTriangle}</Text>
            <Text style={styles.text}>{child.name}</Text>
          </View>
          </Pressable>
          {expandItems.findIndex((e) => e.name == child.name && e.order == child.order && e.parentKey == child.parentKey) !== -1 && displayExpandedNest(child)}
      </View>
    );
  }
  function displayExpandedNest(child){
    const color = child.color.value;
    let type = 'Task';
    if(child.type == 'Nested Images'){
      type = 'Image';
    }
    return(
      <View style={styles.nested}>
        <View style={styles.formBtns}>
          {displayButton(icons.Left, () => {setExpandedItems(expandItems.filter((e) => e.order !== child.order || e.name !== child.name || e.parentKey !== child.parentKey)); clearInputs(); }) /* Back Btn */}
          {(updateItem == null || updateItem[0] !== child.name || updateItem[1] !== child.order || updateItem[2] !== child.parentKey) &&  displayButton('Update', () => {clearInputs(); setColorInput(child.color); setUpdateItem([child.name, child.order, child.parentKey])})}
          {displayButton(icons.Trash, () => setDeleteItem([child.name, child.order, child.parentKey])) /* Delete Btn */}

          {child.type == 'Nested Tasks' && <View>
            {!child.showCompleted && <Pressable onPress={() => {setBooleanInput(!booleanInput); updateChildCheck(child, null, null, null, null, true); setErrorMessage('Refresh')}}><Text style={[styles.symbol, {color: color}]}>{icons.Circle}</Text></Pressable>}
            {child.showCompleted && <Pressable onPress={() => {setBooleanInput(!booleanInput); updateChildCheck(child, null, null, null, null, false); setErrorMessage('Refresh')}}><Text style={[styles.symbol, {color: color}]}>{icons.FilledCircle}</Text></Pressable>}
          </View>}
          {displayButton(decodeEntity('&#43;'), () => {clearInputs(); setColorInput(colors[0]); setAddItem([child.name, child.order, child.children.length, child.parentKey]); setDropdownInput({type: type})}) /* Add Btn */}
        </View>
        {addItem !== null && addItem.constructor === Array && addItem[0] == child.name && addItem[1] == child.order && addItem[3] == child.parentKey && displayAddForm(false)}
        {updateItem !== null && updateItem[0] == child.name && updateItem[1] == child.order && updateItem[2] == child.parentKey && displayUpdateChildForm(child)}
        {moveItem !== null && moveItem[0] == child.name && moveItem[1] == child.order && moveItem[2] == child.parentKey && displayMoveChildForm(child)}
        {deleteItem !== null && deleteItem[0] == child.name && deleteItem[1] == child.order && deleteItem[2] == child.parentKey && displayDeleteChildForm(child)}
        {displayChildren(child.children, child.showCompleted)}
    </View>
    );
  }
  function displayChildDirectory(child){
    const color = child.color.value;
    return (
      <View key={child.name+child.order} style={[styles.child, {borderColor: color}]}>
        <Pressable onPress={() => openDirectory(child)}>
          <Text style={styles.text}>{child.name}</Text>
        </Pressable>
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
      width: '96%',
      borderRadius: theme.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settings: {
      width: '80%',
    },
    form: {
      width: '100%',
      borderWidth: 2,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      paddingHorizontal: 6,
      paddingVertical: 4,
      marginVertical: 2,
    },
    formBtns: {
      flexDirection: 'row',
      verticalAlign: 'middle',
      textAlign: 'center',
      justifyContent: 'space-around',
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
      padding: 4,
      paddingHorizontal: 8,
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
    symbol: {
      fontSize: theme.symbolSize,
      verticalAlign: 'middle',
    },

    header: {
      display: 'flex', 
      flexDirection: 'row',
      backgroundColor: this.color,
      paddingTop: 40,
      width: '88%',
      justifyContent: 'space-between',
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
    headerBack: {
      flexDirection: 'row',
    },

    children: {
      backgroundColor: theme.childrenBackgroundColor,
      borderRadius: theme.borderRadius,
      paddingTop: 8,
      padding: 4,
      width: '88%',
      height: '84%',
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
      justifyContent: 'space-between',
    },
    nested: {
      borderStyle: theme.borderStyle,
      borderColor: theme.borderColor,
      borderRadius: theme.borderRadius,
      backgroundColor: theme.nestBackgroundColor,
      marginBottom: 4,
      marginHorizontal: 4,
    },
    task: {
      verticalAlign: 'middle',
      textAlign: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    NotePreview: {
      paddingLeft: 4,
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