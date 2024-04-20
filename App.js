import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton, Checkbox } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [shouldLoadData, setShouldLoadData] = useState(true);
  const [categoryVisibility, setCategoryVisibility] = useState([]);
  const [categoryCheckedVisibility, setCategoryCheckedVisibility] = useState([]);

  const [addCategoryVisibility, setAddCategoryVisibility] = useState(false); // addCategory, 
  const [addItemVisibility, setAddItemVisibility] = useState(false); // addItem, 
  const [updateModalVisibility, setUpdateModalVisibility] = useState(false); // addItem, 
  const [deleteConfirmationVisibility, setDeleteConfirmationVisibility] = useState(false); // addCategory, 
  const [noteVisibility, setNoteVisibility] = useState(false);
  const [picsVisibility, setPicsVisibility] = useState(false);


  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [checked, setChecked] = useState('first');

  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [userTitle, setUserTitle] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const [userArr, setUserArr] = useState([]);
  const [userInt, setUserInt] = useState(0);
  const [userBoolean, setUserBoolean] = useState(false);

  useEffect(() => {
    if(noteVisibility){
      AsyncStorage.setItem(JSON.stringify(userTitle), userText);
    }
  }, [categoryData, userText, categoryItems]);

  // Category Stuff
  const addCategory = () => {
    let isValid = true;
    const addCategoryTitle = userTitle;
    // Check if Title is valid
    const result = categories.filter((item) => item.title == addCategoryTitle);
    if(addCategoryTitle.length <= 0){
      console.log("Category names cannot be empty.");
      setErrorMessage("Category names cannot be empty.");
      isValid = false;
    }
    else if(result.length > 0){
      console.log("That category title is taken.");
      setErrorMessage("That category title is taken.");
      isValid = false;
    }
    else{
      console.log("Made category: " + addCategoryTitle);
    }

    if(isValid){
      const newCategory = {
        title: addCategoryTitle,
        color: userText,
        data: [],
        show: true,
        showCompleted: false
      }


      setCategoryItems([...categoryItems, {label: addCategoryTitle, value: addCategoryTitle}]);
      setCategoryVisibility([...categoryCheckedVisibility, addCategoryTitle]);
      console.log("Added :", categoryItems);

      let editCatagories = categories;
      editCatagories.splice(editCatagories.length-2, 0, newCategory);
      setCategories(editCatagories);
      AsyncStorage.setItem('appCategories',JSON.stringify(editCatagories));

      setAddCategoryVisibility(false);
      eraseUserInputs();
    }
  }
  const updateCategory = (updateTitle) => {
    let isValid = true;
    const addCategoryTitle = userTitle;
    // Check if Title is valid
    const result = categories.filter((item) => item.title == addCategoryTitle);
    if(addCategoryTitle.length <= 0){
      console.log("Category names cannot be empty.");
      setErrorMessage("Category names cannot be empty.");
      isValid = false;
    }
    else if(result.length > 0 && addCategoryTitle !== updateTitle){
      console.log("That category title is taken.");
      setErrorMessage("That category title is taken.");
      isValid = false;
    }

    if(isValid){
      console.log("Update category: " + updateTitle);

      let editCategoryItems = categoryItems;
      let index = -1;
      for(let i=0; i < editCategoryItems.length; i++){
        if(editCategoryItems[i].title == updateTitle){
          console.log(editCategoryItems[i]);
          editCategoryItems[i].title = addCategoryTitle;
          editCategoryItems[i].color = userText;
          break;
        }
      }
      setCategoryItems(editCategoryItems);

      let editCatagories = categories;
      for(let i=1; i < editCatagories.length-2; i++){
        if(editCatagories[i].title == updateTitle){
          index = i;
          editCatagories[i].title = addCategoryTitle;
          editCatagories[i].color = userText;
          break;
        }
      }

      for(let i=0; i < editCatagories[index].data.length; i++){
        editCatagories[index].data[i].category = addCategoryTitle;
      }

      let editCategoryData = categoryData;
      const editableData = editCategoryData.filter((e) => e.category == updateTitle);
      for(let i=0; i < editableData.length; i++){
        editableData[i].category = addCategoryTitle;
      }

      setCategoryData(editCategoryData);
      AsyncStorage.setItem('appCategoryData', JSON.stringify(editCategoryData));
      setCategories(editCatagories);
      AsyncStorage.setItem('appCategories',JSON.stringify(editCatagories));
      setUpdateModalVisibility(!updateModalVisibility);
      eraseUserInputs();
    }
  }
  const deleteCategory = () => {
    const category = userTitle;
    console.log("Delete Category: " + category);
    let editCatagories = categories;
    const obj = editCatagories.filter((item) => item.title == category);
    let index = categories.indexOf(obj[0]);
    editCatagories.splice(index, 1);

    let tempData = categoryData;
    const editItems = tempData.filter(e => e.category == category);
    if(editItems.length > 0){
      for(let i=0; i< editItems.length; i++){
        index = tempData.indexOf(editItems[i]);
        tempData.splice(index, 1);
      }
      setCategoryData(tempData);
      AsyncStorage.setItem('appCategoryData', JSON.stringify(tempData));
    }

    let editCategoryItems = categoryItems;
    index = editCategoryItems.indexOf(category);
    editCategoryItems.splice(index, 1);
    setCategoryItems(editCategoryItems);
    console.log("Deleted Items: ", categoryItems);


    AsyncStorage.setItem('appCategories', JSON.stringify(editCatagories));
    setDeleteConfirmationVisibility(false);
    eraseUserInputs();
  }
  
  // Item Stuff
  const addItem = () => { // Title: userTitle, Category: categoryValue, isPinned: userBoolean
    let isValid = true;
    let addItem;
    if(checked == 'second'){ // Note
      addItem = {
        title: userTitle,
        category: categoryValue,
        sortingNum: parseInt(userText),
        isPinned: userBoolean,
        type: 0,
        makeDate: null
      };

      if(addItem.title == "appCategories" || addItem.title == "appCategoryData"){ // Note Name check
        setErrorMessage("Note title cannot be ", addItem.title, ".");
        isValid = false;
      }
      else if(categoryData.filter(e => e.title === addItem.title+"Pics").length > 0){
        setErrorMessage("Item title has been taken.");
        isValid = false;
      }
    }
    else{ // List Item
      addItem = {
        title: userTitle,
        category: categoryValue,
        sortingNum: parseInt(userText),
        isPinned: userBoolean,
        type: 1,
        remakeNum: 0,
        makeDate: null
      };
    }

    const today = new Date();
    addItem.makeDate = (today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate());
    if(addCategory != "" || addCategory != null){
      for(var i = 1; i<categories.length -2; i++){
        if(categories[i].title == addCategory){
          const tempArr = (items.filter((item) => item.category == categories[i].title));
          addItem.sortingNum = tempArr.length;
        }
      }
    }

    if(addItem.title == ""){
      setErrorMessage("Item title cannot be empty.");
      isValid = false;
    }
    else if(categoryData.filter(e => e.title === addItem.title).length > 0){
      setErrorMessage("Item title has been taken.");
      isValid = false;
    }

    if(isValid){
      console.log("Add Item: ", addItem.title);
      let tempData = categoryData;

      const catData = tempData.filter((e) => e.category == addItem.category);
      for(let i=catData.length; i > addItem.sortingNum; i--){
        const index = tempData.findIndex((e) => e.category == addItem.category && e.sortingNum == i-1);
        tempData[index].sortingNum = i;
      }

      tempData.push(addItem);
      AsyncStorage.setItem('appCategoryData', JSON.stringify(tempData));
      setCategoryData(tempData);
      if(addItem.isPinned){
        sortCategory("Pinned");
      }
      if(addItem.category != null && addItem.category != ""){
        sortCategory(addItem.category);
      }
      if(addItem.type == 0){ // Note
        sortCategory("Notes");
      }
      else{ // List Item
        sortCategory("List Items");
      }
      
      setAddItemVisibility(false);
      eraseUserInputs();
    }
  }
  const updateItem= (updateTitle) => { // userArr == [{title: category title, num: sorting num}]
    console.log("Updating Item: ", updateTitle);
    const newTitle = userTitle;
    const newIsPinned = userBoolean;
    const newCategory = categoryValue;
    const limit = categoryData.filter((e) => e.category == categoryValue).length -1;
    if(parseInt(userText) < 0){
      setUserText("" + 0);
    }
    else if(parseInt(userText) > limit){
      setUserText("" + limit);
    }
    const newSortingNum = parseInt(userText);

    let editCategoryData = categoryData;
    const oldItem = categoryData.filter((e) => e.title == updateTitle)[0];
    let index = editCategoryData.indexOf(editCategoryData.filter((e) => e.title == updateTitle)[0]);

    editCategoryData[index].title = newTitle;
    editCategoryData[index].category = newCategory;
    editCategoryData[index].isPinned = newIsPinned;
    editCategoryData[index].sortingNum = newSortingNum;

    if(oldItem.category !== newCategory){ // Is in different category
      const oldCategoryData = categoryData.filter((e) => e.category == oldItem.category);
      for(let i=oldItem.sortingNum+1; i<oldCategoryData.length -1; i++){  // needs to iterate through and edit sorting numbers
        const tempIndex = editCategoryData.indexOf(editCategoryData.filter((e) => e.category == oldItem.category && e.sortingNum == i)[0]);
        editCategoryData[tempIndex].sortingNum = i-1;
      }
      const newCategoryData = categoryData.filter((e) => e.category == newCategory);
      for(let i=newSortingNum; i<newCategoryData; i++){
        const tempIndex = editCategoryData.indexOf(editCategoryData.filter((e) => e.category == oldItem.category && e.sortingNum == i && e.title !== newTitle)[0]);
        editCategoryData[tempIndex].sortingNum = i+1;
      }
    }
    else{ // Is in same category
      console.log("Same");
      const currentCategoryData = editCategoryData.filter((e) => e.category == newCategory);
      if(oldItem.sortingNum < newSortingNum){ // Item was moved back in the array
          for(let i=oldItem.sortingNum; i<newSortingNum; i++){
            const tempIndex = editCategoryData.indexOf(editCategoryData.filter((e) => e.category == newCategory && e.sortingNum == i+1)[0]);
            editCategoryData[tempIndex].sortingNum = i-1;
          }
      }
      else{
      for(let i=newSortingNum; i<currentCategoryData.length; i++){
        const tempIndex = editCategoryData.indexOf(currentCategoryData.filter((e) => e.category == newCategory && e.sortingNum == i && e.title !== newTitle)[0]);
        if(tempIndex >= 0){
          editCategoryData[tempIndex].sortingNum = i-1;
        }
      }
    }
    }

    setCategoryData(editCategoryData);
    AsyncStorage.setItem('appCategoryData', JSON.stringify(editCategoryData));

    sortCategory("Pinned");

    if(oldItem.type == 0){ // Note
      AsyncStorage.getItem(JSON.stringify(updateTitle)).then((value) => {
        AsyncStorage.setItem(JSON.stringify(newTitle), value);
      });
      AsyncStorage.getItem(updateTitle + "Pics").then((value) => {
        AsyncStorage.setItem(newTitle + "Pics", value);
      });
      AsyncStorage.removeItem(updateTitle + "Pics");
      sortCategory("Notes");
    }
    else{ // List Items
     sortCategory("List Items");
    }

    if(oldItem.category !== newCategory){
      sortCategory(oldItem);
      sortCategory(newCategory);
    }
    else{
      sortCategory(newCategory);
    }

    setUpdateModalVisibility(false);
    eraseUserInputs();
  }
  const deleteItem = () => {
    const title = userTitle;
    const item = categoryData.filter((e) => e.title == title)[0];
    console.log("Deleting Item: ", title);

    let editCategoryData = categoryData;

    let index = editCategoryData.indexOf(categoryData.filter((e) => e.title == title)[0]);
    editCategoryData.splice(index, 1);

    for(let i=editCategoryData.filter((e) => e.category == item.category).length; i > item.sortingNum; i--){
      index = editCategoryData.findIndex((e) => e.category == item.category && e.sortingNum == i);
      editCategoryData[index].sortingNum = i-1;
    }

    setCategoryData(editCategoryData);
    AsyncStorage.setItem('appCategoryData', JSON.stringify(editCategoryData));

    if(item.isPinned){
      sortCategory("Pinned");
    }
    
    const category = categories.filter((e) => e.title == item.category);
    if(category.length > 0){
      for(let i=0;i<category.length; i++){
        sortCategory(category[i].title);
      }
    }

    if(item.type == 0){ // Note
      const num = categories.length - 1;
      sortCategory("Notes");
      AsyncStorage.removeItem(JSON.stringify(title));
    }
    else{ // List Item
      sortCategory("List Items");
    }

    setDeleteConfirmationVisibility(false);
    eraseUserInputs();
  }
  const completeItem = (title, category, oldSortingNum) => {
    let data = categoryData;
    const index = data.findIndex((e) => e.title == title);
    if(data[index].completeDate != undefined){
      unCheckItem(title, category, oldSortingNum);
      eraseUserInputs();
      return;
    }
    const today = new Date();
    data[index].completeDate = (today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate());
    console.log(oldSortingNum);

    AsyncStorage.setItem('appCategoryData', JSON.stringify(data));
    setCategoryData(data);
    sortCategory(category, data);
    eraseUserInputs();
  }
  const unCheckItem = (title, category, oldSortingNum) => {
    console.log("UnCheck: ", title);
    let data = categoryData;
    const index = data.findIndex((e) => e.title == title);
    data[index].completeDate = undefined;
    console.log(oldSortingNum);

    AsyncStorage.setItem('appCategoryData', JSON.stringify(data));
    setCategoryData(data);
    sortCategory(category, data);
    eraseUserInputs();
  }

  // Note Pictures
  const displayNote = (noteTitle) =>{
    const str = noteTitle + "Pics";
    noteTitle = JSON.stringify(noteTitle);
    let value = AsyncStorage.getItem(noteTitle).then((value) => {
      if(!value){
        console.log('Making New Note Key');
        AsyncStorage.setItem(noteTitle, "");
     }
     else{
         if(value != undefined){
         setUserText(value);
         }
      }
    });
    
    value = AsyncStorage.getItem(str).then((value) => {
      if(!value){
        console.log('Making New Note Key');
        AsyncStorage.setItem(noteTitle, JSON.stringify([]));
      }
      else{
        setImages(JSON.parse(value));
      }
    });
    setNoteVisibility(true);
  }
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      let title = userTitle;
      title += "Pics";
      console.log("Picture Added");
      let temp = images;
      temp.push(result.assets[0].uri);
      const tempTitle = userTitle;
      const tempText = userText;
      eraseUserInputs();
      setUserTitle(tempTitle);
      setUserText(tempText);
      setImages(temp);
      AsyncStorage.setItem(title, JSON.stringify(temp));

    }
  };
  const displayPics = () => {
    return images.map((name, index) => {
      return(
        <View key={name}>
          <Pressable onPress={() => {setUserInt(index); setChecked('third'); setDeleteConfirmationVisibility(true)}}>
            <Image key={name} source={{ uri: name}} style={{ width: 200, height: 200 }} />
          </Pressable>
        </View>
      );
    })
  }
  const deletePic = () => {
    const title = userTitle;
    const text = userText;
    let pics = images;
    pics.splice(userInt, 1);
    setImages(pics);
    const str = userTitle + "Pics";
    AsyncStorage.setItem(str, JSON.stringify(pics));
    setDeleteConfirmationVisibility(false);
  }

  // Modals
  const noteModal = () => {
    return(
      <View style={styles.noteView}>
          <Text >{userTitle}</Text>
          <Button title='Exit' onPress={() => {AsyncStorage.setItem(JSON.stringify(userTitle + "Pics"), JSON.stringify(images)); AsyncStorage.setItem(JSON.stringify(userTitle), userText).then(() =>{eraseUserInputs() });setNoteVisibility(false);}}/>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          {/*displayPics()*/}
          <TextInput style={styles.textBox} multiline={true} value={userText} onChangeText={setUserText}/>

      </View>
    );
  }
  const notePicturesModal = () => {
    return(
      <View>
        <Button title='Back' onPress={() => {setPicsVisibility(false)}}/>
        <Button title='Exit' onPress={() => {setPicsVisibility(false); setNoteVisibility(false)}}/>
        {displayPics()}
      </View>
    );
  }
  const addItemModal = () => {
    let int;
    if(addItemVisibility){
      int = parseInt(userText);
    }
    else{
      int =0;
    }
    if(int < 0){
      setUserText('' + 0);
    }
    else if(int > categoryData.filter((e) => e.category == categoryValue && !e.completeDate).length){
      setUserText('' + categoryData.filter((e) => e.category == categoryValue && !e.completeDate).length);
    }
    if(checked != 'second'){ // List Item
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add List Item</Text>
          <Text>{errorMessage}</Text>
          <View style={styles.checkboxContainer}>
            <Text>List Item</Text>
            <RadioButton 
              value='first'
              status={checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('first')}}
            />
            <Text>Note Item</Text>
            <RadioButton 
              value='second'
              status={checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('second')}}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Text>Title: </Text>
            <TextInput value={userTitle} onChangeText={setUserTitle}/>
          </View>
          <View style={styles.checkboxContainer}>
            <Text>Pinned?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
            />
          </View>

          <Text>Category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserText(""+categoryData.filter((e) => e.category == categoryValue).length)}}
          />
          <Text>Sorting Index: </Text>
          <TextInput value={userText} onChangeText={setUserText}/>

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {addItem()}}>
              <Text style={styles.textStyle}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setAddItemVisibility(!addItemVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
    else{ // Note Item
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add Note</Text>
          <Text>{errorMessage}</Text>
          <View style={styles.checkboxContainer}>
            <Text>List Item</Text>
            <RadioButton 
              value='first'
              status={checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('first')}}
            />
            <Text>Note Item</Text>
            <RadioButton 
              value='second'
              status={checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('second')}}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Text>Title: </Text>
            <TextInput value={userTitle} onChangeText={setUserTitle}/>
          </View>
          <View style={styles.checkboxContainer}>
            <Text>Pinned?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
            />
            </View>
          <Text>Category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserText(""+categoryData.filter((e) => e.category == categoryValue).length)}}
          />
          <Text>Sorting Index: </Text>
          <TextInput value={userText} onChangeText={setUserText}/>

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {addItem()}}>
              <Text style={styles.textStyle}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setAddItemVisibility(!addItemVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
  }
  const updateModal = () => { // UserBoolean true: category false: item
    if(checked != 'first'){ // Category
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Update Category: {userArr[0]}</Text>
          <Text>{errorMessage}</Text>
          <Text>List Item</Text>

          <Text>Title: </Text>
          <TextInput value={userTitle} placeholder={userArr[0]} onChangeText={setUserTitle}/>

          <Text>Color: </Text>
          <TextInput value={userText} placeholder={userArr[1]} onChangeText={setUserText}/>

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {updateCategory(userArr[0])}}>
              <Text style={styles.textStyle}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() =>{ deleteCategory(); eraseUserInputs(); setUpdateModalVisibility(!updateModalVisibility); }}>
              <Text style={styles.textStyle}>Delete</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
    else{ // Item
      let title = '';

      let type = 'Note';
      if(userArr.length > 0){
        title = userArr[0].title;
      }
      if(userArr.length > 0 && userArr[0].type !== 0){
        type = 'List';
      }
      if(updateModalVisibility){
        const limit = categoryData.filter((e) => e.category == categoryValue && !e.completeDate).length -1;
        if(parseInt(userText) < 0){
          setUserText("" + 0);
        }
        else if(parseInt(userText) > limit){
          setUserText("" + limit);
        }
      }
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Update {type} Item: {title}</Text>
          <Text>{errorMessage}</Text>

          <Text>Title: </Text>
          <TextInput value={userTitle} placeholder={title} onChangeText={setUserTitle}/>

          <Text>Pinned?: </Text>
          <Checkbox 
            status={userBoolean ? 'checked' : 'unchecked'}
            onPress={() => {setUserBoolean(!userBoolean);}}
          />
          
          <Text>Category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserInt(categoryData.filter((e) => e.category == categoryValue).length); setUserText("" + categoryData.filter((e) => e.category == categoryValue).length)}}
          />

          <Text>Sorting Index: </Text>
          <TextInput value={userText} onChangeText={setUserText}/>

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {updateItem(title)}}>
              <Text style={styles.textStyle}>Update Item</Text>
            </Pressable>

            <Button style={[styles.button, styles.buttonClose]} title="Delete" onPress={() => {deleteItem(); setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}/>


            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
  }
  const deleteModal = () => { // checked : second: category first: item third: Picture
    if(checked == 'second'){
      return (
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Delete Category: {userTitle}: {userText}?</Text>
          <Text>{errorMessage}</Text>
    
          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => deleteCategory()}>
              <Text style={styles.textStyle}>Delete</Text>
            </Pressable>
      
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {eraseUserInputs(); setDeleteConfirmationVisibility(!deleteConfirmationVisibility)}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
        </View>
      );
    }
    else if(checked == 'third'){
      return (
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Delete Picture?</Text>
          <Text>{errorMessage}</Text>
    
          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => deletePic()}>
              <Text style={styles.textStyle}>Delete</Text>
            </Pressable>
      
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setDeleteConfirmationVisibility(!deleteConfirmationVisibility)}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
        </View>
      );
    }
    else{
      let type = "";
      if(userInt == 0){
        type = "Note";
      }
      else{
        type = "List Item";
      }
      return(
        <View style={styles.modalView}>
         <Text style={styles.modalText}>Delete {type}: {userTitle}?</Text>
          <Text>{errorMessage}</Text>
  
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => deleteItem()}>
            <Text style={styles.textStyle}>Delete</Text>
          </Pressable>
    
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {eraseUserInputs(); setDeleteConfirmationVisibility(!deleteConfirmationVisibility)}}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
        </View>
      );
    }
  }

  // Misc
  const toggleCategoryVisibility = (title) => {
    let temp = categoryVisibility;
    if(temp.includes(title)){
      temp.splice(temp.indexOf(title), 1)
    }
    else{
      temp.push(title)
    }
      setCategoryVisibility(temp);

      temp = categories;
      let index = temp.findIndex((e) => e.title == title);
      temp[index].show = !temp[index].show;
      setCategories(temp);
      temp =  AsyncStorage.setItem('appCategories', JSON.stringify(temp));

      eraseUserInputs();
  }
  const toggleCategoryCheckedVisibility = (title) => {
    let temp = categoryCheckedVisibility;
    if(temp.includes(title)){
      temp.splice(temp.indexOf(title), 1)
    }
    else{
      temp.push(title)
    }
      setCategoryCheckedVisibility(temp);

      temp = categories;
      let index = temp.findIndex((e) => e.title == title);
      temp[index].showCompleted = !temp[index].showCompleted;
      setCategories(temp);
      temp =  AsyncStorage.setItem('appCategories', JSON.stringify(temp));

      eraseUserInputs();
  }
  const eraseUserInputs = () => {
    console.log("Clear");
    setErrorMessage(null);
    setUserTitle(null);
    setUserText(null);
    setChecked('first');
    setUserInt(0);
    setUserBoolean(false);
    setCategoryOpen(false);
    setCategoryValue(null);    
    setUserArr([]);
    setImages([]);
  }
  const sortCategory = (editCategory, items=[]) => {
    console.log("Sorting: ", editCategory);
    let filterData = items;
    if(items.length <= 0){
      filterData = categoryData;
    }
    let data = [];
    if(editCategory == "Pinned"){
      data = filterData.filter((e) => e.isPinned == true);
    }
    else if(editCategory == "List Items"){
      data = filterData.filter((e) => e.type > 0);
    }
    else if(editCategory == "Notes"){
      data = filterData.filter((e) => e.type == 0);
    }
    else{
      data = filterData.filter((e) => e.category == editCategory);
    }

    let sortedData = [];
    for(let i=0; i<data.length; i++){
      sortedData.push({title: "Empty"});
    }

    if(editCategory!== 'Pinned' && editCategory !== 'List Items' && editCategory !== 'Notes'){
      for(let i=0; i<data.length; i++){
        let currentItem = data.filter((e) => e.sortingNum == i)[0];
        sortedData[i] = currentItem;
      }
    }
    else{
      for(let i=0; i<data.length; i++){
        sortedData[i] = data[i];
      }
    }
    let fixCategories = categories;
    index = categories.findIndex((e) => e.title == editCategory);
    fixCategories[index].data = sortedData;
    setCategories(fixCategories);
  }

  if(shouldLoadData){
    //Store Categories Pinned should always be first List Items and Notes should always be last
    let value = AsyncStorage.getItem('appCategories').then((value) => {
      if(!value){
        console.log('Making New Lists Key');
        const temArr = [
          {
            title: "Pinned",
            color: "Pinned",
            data: [],
            show: true,
            showCompleted: false
          },
          {
            title: "List Items",
            color: "List Items",
            data: [],
            show: false,
            showCompleted: false
          },
          {
            title: "Notes",
            color: "Notes",
            data: [],
            show: false,
            showCompleted: false
          },
        ];
        setCategories(temArr);
        AsyncStorage.setItem('appCategories', JSON.stringify(temArr));
        let tempCatVis = [];
        tempCatVis.push('Pinned');
        tempCatVis.push('Notes');
        tempCatVis.push('List Items');
        setCategoryVisibility(tempCatVis);
      }
      else{
        setCategories(JSON.parse(value));
        let tempArr = [];
        let tempCatVis = [];
        JSON.parse(value).forEach(cat => {
          if(cat.showCompleted){
            tempArr.push(cat.title);
          }
          if(cat.show){
            tempCatVis.push(cat.title);
          }
        });
        setCategoryVisibility(tempCatVis);
        setCategoryCheckedVisibility(tempArr);
      }
      setShouldLoadData(false);
    }); 

    value = AsyncStorage.getItem('appCategoryData').then((value) => {
      if(!value){
        console.log('Making New Data Key');
        AsyncStorage.setItem('appCategoryData', JSON.stringify([]));
        for(let i=0; i<categories.length; i++){
          if(categories[i].title !== "Pinned" && categories[i].title !== "List Items" && categories[i].title !== "Notes"){
            tempCategoryItems.push({label: categories[i].title, value: categories[i].title});
          }
        }
      }
      else{
        setCategoryData(JSON.parse(value));
        let tempCategoryItems = [];
        for(let i=0; i<categories.length; i++){
          if(categories[i].title !== "Pinned" && categories[i].title !== "List Items" && categories[i].title !== "Notes"){
            tempCategoryItems.push({label: categories[i].title, value: categories[i].title});
          }
          sortCategory(categories[i].title, JSON.parse(value));
        }
        setCategoryItems(tempCategoryItems);
      }
    }); 

    if(categories.length >= 3){
      setShouldLoadData(false);
    }
  }
  else{
    let currentCategory = '';
    return(
      <SafeAreaView style={styles.app}>
        <View style={styles.topHeader}>
        <Button style={styles.settingsBtn} title='*' onPress={() => {}}/>
          <Text style={styles.appTitle}>Idea Manager</Text>
          <Button style={styles.addBtn} title='+' onPress={() => {setAddCategoryVisibility(true)}}/>
        </View>

        <SectionList
          sections={categories}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => {
            let style = [styles.item];
            const show = categoryVisibility.includes(currentCategory);
            if(show){
              const showCompleted = categoryCheckedVisibility.includes(currentCategory);
              if(showCompleted){
                if(currentCategory == item.category && item.sortingNum == categoryData.filter((e) => e.category == item.category).length -1){
                  style.push(styles.endBorder);
                }

                if(item.type == 0){ // Note
                  return (
                    <View style={style}>
                      <Pressable  onPress={() => {setUserArr([item]); setUserTitle(item.title); setUserText('' + item.sortingNum); setUserInt(item.sortingNum); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                      <Text style={styles.text}>Note</Text>
                      </Pressable>
                      <Pressable onPress={() => {setUserTitle(item.title); displayNote(item.title)}}>
                        <Text style={styles.text}>{item.title}</Text>
                      </Pressable>
                      <Button title="Delete" onPress={() => {setUserBoolean(false); setUserTitle(item.title); setUserInt(item.type); setDeleteConfirmationVisibility(true)}}/>
                  </View>
                  );
                }
                else if(item.type !== undefined){ // List Item
                  return (
                    <View style={style}>
                      <Checkbox 
                        status={item.completeDate != undefined? 'checked' : 'unchecked'}
                        onPress={() => completeItem(item.title, item.category, item.sortingNum)}
                      />
                      <Pressable onPress={() => {setUserArr([item]); setUserTitle(item.title); setUserText('' + item.sortingNum); setUserInt(item.sortingNum); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                        <Text style={styles.text}>{item.title}</Text>
                      </Pressable>
                  </View>
                  );
                }
              }
              else{
                const catIndex = categories.findIndex((e) => e.title == currentCategory);
                const catData = categories[catIndex].data;
                let lastIndex = null;
                for(let i=catData.length-1; i != 0; i--){
                  if(catData[i].completeDate == undefined){
                    lastIndex = catData[i].sortingNum;
                    break;
                  }
                }
                if(item.sortingNum == lastIndex){
                  style.push(styles.endBorder);
                }

                if(item.type == 0){ // Note
                  return (
                    <View style={style}>
                      <Pressable  onPress={() => {setUserArr([item]); setUserTitle(item.title); setUserText('' + item.sortingNum); setUserInt(item.sortingNum); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                      <Text style={styles.text}>Note</Text>
                      </Pressable>
                      <Pressable onPress={() => {setUserTitle(item.title); displayNote(item.title)}}>
                        <Text style={styles.text}>{item.title}</Text>
                      </Pressable>
                      <Button title="Delete" onPress={() => {setUserBoolean(false); setUserTitle(item.title); setUserInt(item.type); setDeleteConfirmationVisibility(true)}}/>
                  </View>
                  );
                }
                else if(item.type !== undefined && !item.completeDate){ // List Item
                  return (
                    <View style={style}>
                      <Checkbox 
                        status={item.completeDate != undefined? 'checked' : 'unchecked'}
                        onPress={() => completeItem(item.title, item.category, item.sortingNum)}
                      />
                      <Pressable onPress={() => {setUserArr([item]); setUserTitle(item.title); setUserText('' + item.sortingNum); setUserInt(item.sortingNum); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                        <Text style={styles.text}>{item.title}</Text>
                      </Pressable>
                  </View>
                  );
                }
              }
            }
          }}
          renderSectionHeader={({section: {title, color, showCompleted, show}}) => {
            currentCategory = title;
            let style = [styles.sectionHeader];
            if(title == "Pinned"){
              if(!show || categoryData.find((e) => e.isPinned && e.completeDate == undefined) == undefined  || showCompleted && categoryData.find((e) => e.isPinned) == undefined){
                style.push(styles.endBorder);
              }
              return(
                <View style={style}>
                  <View style={styles.checkboxContainer}>
                  <Pressable onPress={() => {}}>
                    <Text style={styles.text}>{title}</Text>
                  </Pressable>
                    <Checkbox 
                    status={categoryVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryVisibility(title);}}
                    />
                  </View>
                  <Button title='+' onPress={() => {setUserTitle(title); setUserBoolean(true); setAddItemVisibility(true)}}/>
                </View>
              );
            }
            if(title == "List Items"){
              if(!show || categoryData.find((e) => e.type !== 0 && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.type !== 0) == undefined)){
                style.push(styles.endBorder);
              }
              return(
                <View style={style}>
                  <View style={styles.checkboxContainer}>
                  <Pressable onPress={() => {}}>
                    <Text style={styles.text}>{title}</Text>
                  </Pressable>
                    <Checkbox 
                    status={categoryVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryVisibility(title);}}
                    />
                  </View>
                  <Button title='+' onPress={() => {setAddItemVisibility(true)}}/>
                </View>
                );
            }
            else if(title == "Notes"){
              if(!show || categoryData.find((e) => e.type == 0 && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.type == 0) == undefined)){
                style.push(styles.endBorder);
              }
              return(
                <View style={style}>
                  <View style={styles.checkboxContainer}>
                  <Pressable onPress={() => {}}>
                    <Text style={styles.text}>{title}</Text>
                  </Pressable>
                    <Checkbox 
                    status={categoryVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryVisibility(title);}}
                    />          
                  </View>
                  <Button title='+' onPress={() => {setChecked('second'); setUserInt(0); setAddItemVisibility(true)}}/>
                </View>
                );
            }
            if(!show || categoryData.find((e) => e.category == title && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.category == title) == undefined)){
              style.push(styles.endBorder);
            }
            return(
              <View style={style}>
                  <View style={styles.checkboxContainer}>
                  <Pressable onPress={() => {setUserTitle(title); setUserText(color); setUserArr([title, color]); setChecked('second');  setUpdateModalVisibility(true)}}>
                    <Text style={styles.text}>{title}</Text>
                  </Pressable>
                    <Checkbox 
                    status={categoryVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryVisibility(title);}}
                    />
                  </View>
                  <View style={styles.checkboxContainer}>
                    <Text style={styles.text}>Completed?</Text>
                    <Checkbox 
                    status={categoryCheckedVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryCheckedVisibility(title);}}
                    />
                  </View>
                <Button title='+' onPress={() => {setCategoryValue(title); setUserText(""+categoryData.filter((e) => e.category == title).length); setAddItemVisibility(true)}}/>
              </View>
              );
          }}
        />
        {/* Add Category*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={addCategoryVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            eraseUserInputs();
            setAddCategoryVisibility(!addCategoryVisibility);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Add Category</Text>
              <Text>{errorMessage}</Text>
              <Text>Title: </Text>
              <TextInput value={userTitle} onChangeText={setUserTitle}/>
              <Text>Color: </Text>
              <TextInput value={userText} onChangeText={setUserText}/>

              <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => addCategory()}>
                  <Text style={styles.textStyle}>Add Category</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {setAddCategoryVisibility(!addCategoryVisibility); eraseUserInputs();}}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
              </View>
            </View>
        </Modal>

        {/* Add Item*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={addItemVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            eraseUserInputs();
            setAddCategoryVisibility(!addItemVisibility);
          }}
        >
          <View style={styles.centeredView}>
              {addItemModal()}
            </View>
        </Modal>

        {/* Update Modal*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={updateModalVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setUpdateModalVisibility(!updateModalVisibility);
          }}
        >
          <View style={styles.centeredView}>
            {updateModal()}
          </View>
        </Modal>

        {/* Delete Confirmation*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={deleteConfirmationVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setDeleteConfirmationVisibility(!deleteConfirmationVisibility);
          }}
        >
          <View style={styles.centeredView}>
            {deleteModal()}
          </View>
        </Modal>

        {/* Display Note*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={noteVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            eraseUserInputs();
            setNoteVisibility(!noteVisibility);
          }}
        >
          <View style={styles.centeredView}>
            {noteModal()}
          </View>
        </Modal>

        {/* Display Note Pics*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={picsVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            eraseUserInputs();
            setPicsVisibility(!picsVisibility);
          }}
        >
          <View style={styles.centeredView}>
            {notePicturesModal()}
          </View>
        </Modal>

      </SafeAreaView>
  );
  }
}

const borderWidth = 2;
const styles = StyleSheet.create({
  app: {
    backgroundColor: '#707371',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#A9A9A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#f4f4f4',
    fontSize: 16,
  },
  topHeader: {
    paddingTop: 28,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3c3e3c'
  },
  settingsBtn: {
    alignSelf: 'flex-start',
    position: 'absolute',
  },
  appTitle: {
    color: '#f4f4f4',
  },
  addBtn: {

  },
  endBorder: {
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
  },
  sectionHeader: {
    marginTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 8,
    borderWidth: borderWidth,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    paddingVertical: 8,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: borderWidth,
    borderRightWidth: borderWidth,
    borderBottomWidth: borderWidth,

  },
  modalView: {
    margin: 20,
    backgroundColor: '#707371',
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
  noteView: {
    margin: 20,
    backgroundColor: '#707371',
    borderRadius: 20,
    padding: 35,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'left',
  },
  textBox: {
    width: '100%',
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 2
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },

});