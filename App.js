import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton, Checkbox } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [shouldLoadData, setShouldLoadData] = useState(true);

  const [expandedSections, setExpandedSections] = useState(new Set());
  const [addCategoryVisibility, setAddCategoryVisibility] = useState(false); // addCategory, 
  const [addItemVisibility, setAddItemVisibility] = useState(false); // addItem, 
  const [updateModalVisibility, setUpdateModalVisibility] = useState(false); // addItem, 
  const [deleteConfirmationVisibility, setDeleteConfirmationVisibility] = useState(false); // addCategory, 
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [checked, setChecked] = useState('first');

  const [errorMessage, setErrorMessage] = useState(undefined);
  const [userTitle, setUserTitle] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const [userArr, setUserArr] = useState([]);
  const [userInt, setUserInt] = useState(1);
  const [userBoolean, setUserBoolean] = useState(false);

  useEffect(() => {
    //console.log("Use Effect");
  }, []);

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
        data: []
      }

      let editCategoryItems = categoryItems;
      editCategoryItems.push(newCategory);
      setCategoryItems(editCategoryItems);

      let editCatagories = categories;
      editCatagories.splice(editCatagories.length-2, 0, newCategory);

      setCategories(editCatagories);
      AsyncStorage.setItem('appCategories',JSON.stringify(editCatagories));
      setAddCategoryVisibility(!addCategoryVisibility)
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
    const editItems = tempData.filter(e => e.category === category);
    if(editItems.length > 0){
      for(let i=0; i< editItems.length; i++){
        index = tempData.indexOf(editItems[i]);
        tempData[index].category = null;
      }
      setCategoryData(tempData);
      AsyncStorage.setItem('appCategoryData', tempData);
    }

    let editCategoryItems = categoryItems;
    index = editCategoryItems.indexOf(category);
    if(index >= 0){
      editCategoryItems.splice(index, 1);
      setCategoryItems(editCategoryItems);
    }

    AsyncStorage.setItem('appCategories', JSON.stringify(editCatagories));
    setDeleteConfirmationVisibility(false);
    eraseUserInputs();
  }
  
  const addItem = () => { // Title: userTitle, Category: categoryValue, isPinned: userBoolean
    let isValid = true;
    let addItem
    if(userInt == 0){ // Note
      addItem = {
        title: userTitle,
        category: categoryValue,
        sortingNum: 0,
        isPinned: userBoolean,
        type: userInt,
        makeDate: null
      };
    }
    else{ // List Item
      addItem = {
        title: userTitle,
        category: categoryValue,
        sortingNum: 0,
        isPinned: userBoolean,
        type: userInt,
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
      let tempCategories = categories;
      let tempData = categoryData;
      let categoryNames = [];
      for(let i=0; i<categories.length; i++){
        categoryNames.push(categories[i].title);
      }

      let index = categoryNames.indexOf(addItem.category);
      if(index > 0){
        const previousItem = tempCategories[index].data[tempCategories[index].data.length-1];
        tempCategories[index].data.push(addItem);
        index = tempData.indexOf(previousItem) + 1;
        tempData.splice(index, 0, addItem);
      }
      else{
        tempData.push(addItem);
      }
      if(addItem.isPinned){
        tempCategories[0].data.push(addItem);
      }
      if(addItem.type == 0){ // Note
        tempCategories[tempCategories.length-1].data.push(addItem);
      }
      else{ // List Item
        tempCategories[tempCategories.length-2].data.push(addItem);
      }
      setCategories(tempCategories);
      AsyncStorage.setItem('appCategoryData', JSON.stringify(tempData));
      setAddItemVisibility(false);
      eraseUserInputs();
    }
  }

  const updateItem= (updateTitle) => {
    const newTitle = userTitle;
    const newIsPinned = userBoolean;
    const newCategory = categoryValue;
    let editCategoryData = categoryData;
    const oldItem = editCategoryData.filter((e) => e.title == updateTitle)[0];
    console.log("Updating: ", updateTitle);
    let index = editCategoryData.indexOf(oldItem);
    editCategoryData[index].title = newTitle;
    editCategoryData[index].category = newCategory;
    editCategoryData[index].isPinned = newIsPinned;
    setCategoryData(editCategoryData);
    AsyncStorage.setItem('appCategoryData', JSON.stringify(editCategoryData));

    console.log("Is Old Pinned? ", oldItem.isPinned);
    if(!oldItem.isPinned || newIsPinned){
      console.log("Sort pinned");
      sortCategory("Pinned");
    }
    if(oldItem.category != null && oldItem.category != ""){ // Was in a category
      sortCategory(oldItem.category);
      if(oldItem.category != newCategory && newCategory != null && newCategory != ""){ // Updated to new category
        sortCategory(newCategory);
      }
    }
    else{
      if(newCategory != null && newCategory != ""){
        sortCategory(newCategory);
      }
    }

    if(oldItem.type == 0){ // Note
      sortCategory("Notes");
    }
    else{
     sortCategory("List Items");
    }

    setUpdateModalVisibility(false);
    eraseUserInputs();
  }

  const deleteItem = () => {
    const title = userTitle;
    const item = categoryData.filter((e) => e.title == title)[0];
    console.log("Deleting Item: ", title);

    let editCategories = categories;
    let editCategoryData = categoryData;

    let index = editCategoryData.indexOf(categoryData.filter((e) => e.title == title)[0]);
    editCategoryData.splice(index, 1);


    if(item.isPinned){
      index = editCategories[0].data.indexOf(editCategories[0].data.filter((e) => e.title == title)[0]);
      editCategories[0].data.splice(item, 1);
    }
    
    const category = editCategories.filter((e) => e.title == item.category);
    if(category.length > 0){
      for(let i=0;i<category.length; i++){
        index = editCategories.indexOf(category[i]);
        editCategories[index].data.splice(editCategories[index].data.indexOf(editCategories[index].data.filter((e) => e.title == title)[0]), 1);
      }
    }

    if(item.type == 0){ // Note
      const num = editCategories.length - 1;
      index = editCategories[num].data.indexOf(editCategories[num].data.filter((e) => e.title == title)[0]);
      editCategories[num].data.splice(item, 1);
    }
    else{ // List Item
      const num = editCategories.length - 2;
      index = editCategories[num].data.indexOf(editCategories[num].data.filter((e) => e.title == title)[0]);
      editCategories[num].data.splice(item, 1);
    }

    setCategoryData(editCategoryData);
    AsyncStorage.setItem('appCategoryData', JSON.stringify(editCategoryData));
    setCategories(editCategories);
    setDeleteConfirmationVisibility(false);
    eraseUserInputs();
  }

  const eraseUserInputs = () => {
    console.log("Clear");
    setErrorMessage(null);
    setUserTitle(null);
    setUserText(null);
    setChecked('first');
    setUserInt(1);
    setUserBoolean(false);
    setCategoryOpen(false);
    setCategoryValue(null);    
    setUserArr([]);
  }

  const addItemModal = () => {
    if(checked == 'first'){
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add List Item</Text>
          <Text>{errorMessage}</Text>
          <Text>List Item</Text>
          <RadioButton 
            value='first'
            status={checked === 'first' ? 'checked' : 'unchecked'}
            onPress={() => {setUserInt(1); setChecked('first')}}
          />
          <Text>Note Item</Text>
          <RadioButton 
            value='second'
            status={checked === 'second' ? 'checked' : 'unchecked'}
            onPress={() => {setUserInt(0); setChecked('second')}}
          />

          <Text>Title: </Text>
          <TextInput value={userTitle} onChangeText={setUserTitle}/>
          <Text>Pinned?: </Text>
          <Checkbox 
            status={userBoolean ? 'checked' : 'unchecked'}
            onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
          />
          <Text>category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
          />

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
    else{
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add Note</Text>
          <Text>{errorMessage}</Text>
          <Text>List Item</Text>
          <RadioButton 
            value='first'
            status={checked === 'first' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('first')}
          />
          <Text>Note Item</Text>
          <RadioButton 
            value='second'
            status={checked === 'second' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('second')}
          />

          <Text>Title: </Text>
          <TextInput value={userTitle} onChangeText={setUserTitle}/>
          <Text>Pinned?: </Text>
          <Checkbox 
            status={userBoolean ? 'checked' : 'unchecked'}
            onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
          />
          <Text>category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
          />

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setUserInt(0) ;addItem()}}>
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
              onPress={() => {setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
    else{ // Item
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Update Item: {userArr[0]}</Text>
          <Text>{errorMessage}</Text>
          <Text>List Item</Text>

          <Text>Title: </Text>
          <TextInput value={userTitle} placeholder={userArr[0]} onChangeText={setUserTitle}/>

          <Text>Pinned?: </Text>
          <Checkbox 
            status={userBoolean ? 'checked' : 'unchecked'}
            onPress={() => {setUserBoolean(!userBoolean);}}
          />
          <Text>category: </Text>
          <DropDownPicker
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
          />

          <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {console.log(userBoolean); updateItem(userArr[0])}}>
              <Text style={styles.textStyle}>Update Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
  }

  const deleteModal = () => { // userBoolean : true: category false: item
    if(userBoolean){
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

  const sortCategory = (editCategory) => {
    let data = [];
    if(editCategory == "Pinned"){
      data = categoryData.filter((e) => e.isPinned == true);
    }
    else if(editCategory == "List Items"){
      data = categoryData.filter((e) => e.type > 0);
    }
    else if(editCategory == "Notes"){
      data = categoryData.filter((e) => e.type == 0);
    }
    else{
      data = categoryData.filter((e) => e.category == editCategory);
    }

    let sortedData = [];
    for(let i=0; i<data.length; i++){
      sortedData.push({title: "Empty"});
    }
    for(let i=0; i<data.length; i++){
      //const index = data[i].sortNum;
      sortedData[i] = data[i];
  }
  let fixCategories = categories;
  index = categories.indexOf(categories.filter((e) => e.title == editCategory)[0]);
  fixCategories[index].data = sortedData;
  console.log("Category: ", editCategory, " : ", sortedData);
  setCategories(fixCategories);

  }

  const sortData = (dataArr) => {
    let categoryNames = [];
    let categoryDropDown = categoryItems;
    for(let i=0; i<categories.length; i++){
      const title = categories[i].title;
      categoryNames.push(title);
      if(title !== "Pinned" && title !== "List Items" && title !== "Notes" ){
        categoryDropDown.push({label: title, value: title});
      }
    }
    categoryDropDown.push({label: null, value: null});
    setCategoryItems(categoryDropDown);

    let tempCategories = categories;
    for(let i=0; i<dataArr.length; i++){ 
      if(dataArr[i].isPinned){// Pinned
        tempCategories[0].data.push(dataArr[i]);
      }
      if(dataArr[i].type == 0){ // Note
        tempCategories[tempCategories.length-1].data.push(dataArr[i]);
      }
      else{ // List Item
        tempCategories[tempCategories.length-2].data.push(dataArr[i]);
      }
      // Insert data object into temp categories under its category
      const index = categoryNames.indexOf(dataArr[i].category);
      if(index > 0){
        tempCategories[index].data.push(dataArr[i]);
      }
    }
    setCategories(tempCategories);
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
          },
          {
            title: "List Items",
            color: "List Items",
            data: [],
          },
          {
            title: "Notes",
            color: "Notes",
            data: [],
          },
        ];
        console.log("Temp: " + temArr.length);
        setCategories(temArr);
        AsyncStorage.setItem('appCategories', JSON.stringify(temArr));
      }
      else{
        setCategories(JSON.parse(value));
      }
      setShouldLoadData(false);
    }); 

    value = AsyncStorage.getItem('appCategoryData').then((value) => {
      if(!value){
        console.log('Making New Data Key');
        AsyncStorage.setItem('appCategoryData', JSON.stringify([]));
      }
      else{
        setCategoryData(JSON.parse(value));
        sortData(JSON.parse(value));
      }
    }); 

    if(categories.length >= 3){
      setShouldLoadData(false);
    }
  }
  else{
    return(
      <SafeAreaView>
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

        <Text>{"\n"}Idea Manager{"\n"}</Text>
        <Button title='+' onPress={() => {setAddCategoryVisibility(true)}}/>

        <SectionList 
          sections={categories}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => {
            if(item.type == 0){ // Note
              return (
                <View>
                  <Text>Note</Text>
                  <Pressable onPress={() => {setUserArr([item.title]); setUserTitle(item.title); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                    <Text>{item.title}</Text>
                  </Pressable>
                  <Button title="Delete" onPress={() => {setUserBoolean(false); setUserTitle(item.title); setUserInt(item.type); setDeleteConfirmationVisibility(true)}}/>
              </View>
              );
            }
            else if(item.type !== undefined){
              return (
                <View>
                  <Text>List Item</Text>
                  <Pressable onPress={() => {setUserArr([item.title]); setUserTitle(item.title); setCategoryValue(item.category); setUserBoolean(item.isPinned); setUpdateModalVisibility(true)}}>
                    <Text>{item.title}</Text>
                  </Pressable>
                  <Button title="Delete" onPress={() => {setUserBoolean(false); setUserTitle(item.title); setUserInt(item.type); setDeleteConfirmationVisibility(true)}}/>
              </View>
              );
            }

          }}
          renderSectionHeader={({section: {title, color}}) => {
            if(title == "Pinned"){
              return(
                <View>
                  <Pressable onPress={() => {}}>
                    <Text>{title} : {color}</Text>
                  </Pressable>
                  <Button title='+' onPress={() => {setUserTitle(title); setUserBoolean(true); setAddItemVisibility(true)}}/>
                </View>
              );
            }
            if(title == "List Items"){
              return(
                <View>
                  <Pressable onPress={() => {}}>
                    <Text>{title} : {color}</Text>
                  </Pressable>                  
                  <Button title='+' onPress={() => {setAddItemVisibility(true)}}/>
                </View>
                );
            }
            else if(title == "Notes"){
              return(
                <View>
                  <Pressable onPress={() => {}}>
                    <Text>{title} : {color}</Text>
                  </Pressable>                  
                  <Button title='+' onPress={() => {setChecked('second'); setUserInt(0); setAddItemVisibility(true)}}/>
                </View>
                );
            }
            return(
              <View>
                  <Pressable onPress={() => {setUserTitle(title); setUserText(color); setUserArr([title, color]); setChecked('second');  setUpdateModalVisibility(true)}}>
                    <Text>{title} : {color}</Text>
                  </Pressable>
                <Button title='+' onPress={() => {setCategoryValue(title); setAddItemVisibility(true)}}/>
                <Button title='Delete' onPress={() =>{setChecked('second'); setUserTitle(title); setUserText(color); setDeleteConfirmationVisibility(true)}}/>
              </View>
              );

          }}
        />
      </SafeAreaView>
  );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A9A9A9',
    alignItems: 'center',
    justifyContent: 'center',
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