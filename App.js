import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton, Checkbox } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

let appSettings;

export default function App() {
  const [settings, setSettings] = useState([]);
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
  const [settingsVisibility, setSettingsVisibility] = useState(false);

  const [categoryValue, setCategoryValue] = useState(null);
  const [themeValue, setThemeValue] = useState('Dark');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [checked, setChecked] = useState('first');

  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [userTitle, setUserTitle] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const [userText2, setUserText2] = useState(undefined);
  const [userArr, setUserArr] = useState([]);
  const [userArr2, setUserArr2] = useState([]);
  const [userInt, setUserInt] = useState(0);
  const [userBoolean, setUserBoolean] = useState(false);

  const [themes, setThemes] = useState([
    {label: 'Light', value: 'Light', backgroundColor: '#edede9', categoryBackgroundColor: '#D8C5B6', borderColor: '#000000', modalBackgroundColor: '#D8C5B6', buttonColor: '#C29F8B', textColor: '#000000', borderWidth: 0},
    {label: 'Dark', value: 'Dark', backgroundColor: '#0D1B2A', categoryBackgroundColor: '#415A77', borderColor: '#000000', modalBackgroundColor: '#1B263B', buttonColor: '#778DA9', textColor: '#E0E1DD', borderWidth: 2},
    {label: 'Blue', value: 'Blue', backgroundColor: '#0A369D', categoryBackgroundColor: '#5E7CE2', borderColor: '#000000', modalBackgroundColor: '#4472CA', buttonColor: '#92B4F4', textColor: '#CFDEE7', borderWidth: 0},
    {label: 'Pastel', value: 'Pastel', backgroundColor: '#B0F2B4', categoryBackgroundColor: '#F2BAC9', borderColor: '#FFFFFF', modalBackgroundColor: '#F2BAC9', buttonColor: '#BAF2E9', textColor: '#000000', borderWidth: 4},
  ]);
  //let themes = ;
  let itemSortNums = [];

  let themeIndex = themes.findIndex((e) => e.label == themeValue);

  let textSize = 18;
  let textColor = themes[themeIndex].textColor;
  let headerBackgroundColor = themes[themeIndex].backgroundColor;
  let backgroundColor = themes[themeIndex].backgroundColor;

  let categoryBackgroundColor = themes[themeIndex].categoryBackgroundColor;
  let borderColor = themes[themeIndex].borderColor;
  let borderWidth = themes[themeIndex].borderWidth;

  let buttonColor = themes[themeIndex].buttonColor;
  let textInputBackgroundColor = buttonColor;
  let modalBackgroundColor = themes[themeIndex].modalBackgroundColor;

  const styles = StyleSheet.create({
  app: {
    backgroundColor: backgroundColor,
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: textColor,
    fontSize: textSize,
  },
  topHeader: {
    paddingTop: 28,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',

    alignItems: 'center',
    backgroundColor: headerBackgroundColor
  },

  sectionHeader: {
    marginTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 6,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: borderColor,
    gap: 8,
    marginHorizontal: 8,
    borderWidth: borderWidth,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
    backgroundColor: categoryBackgroundColor,
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
    borderColor: borderColor,
    borderRightWidth: borderWidth,
    borderBottomWidth: borderWidth,
    backgroundColor: categoryBackgroundColor,

  },
  endBorder: {
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    borderColor: borderColor,
  },
  eraseBottomBorder: {
    borderBottomWidth: 0,
  },

  modalView: {
    margin: 20,
    color: textColor,
    backgroundColor: modalBackgroundColor,
    borderRadius: 20,
    borderWidth: borderWidth,
    borderColor: borderColor,
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
    backgroundColor: modalBackgroundColor,
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
  picturesContainer: {
    alignItems: 'center',
  },
  pic :{
    width: 260,
    height: 260,
    borderWidth: borderWidth,
    borderColor: borderColor,
    marginVertical: 8,
  },

  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    color: textColor,
    backgroundColor: buttonColor,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: textColor,
  },
  TextInput: {
    color: textColor,
    fontSize: textSize,
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: textInputBackgroundColor,
  },
  dropDown: {
    color: textColor,
    fontSize: textSize,
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: textInputBackgroundColor,
    width: 'auto',
    display: 'flex',
  },
  textContainer: {
    alignItems: 'left',
    color: textColor,
  },
  });

  useEffect(() => {
    if(noteVisibility){
      AsyncStorage.setItem(JSON.stringify(userArr[0]), userText);
    }
  }, [userText, itemSortNums, themes]);

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
      let newCategory = {
        title: addCategoryTitle,
        color: userText,
        data: [],
        sortNum: categoryItems.length,
        show: true,
        showCompleted: false
      }
      if(userInt != null){
        newCategory.sortNum = userInt;
      }


      setCategoryItems([...categoryItems, {label: addCategoryTitle, value: addCategoryTitle}]);
      console.log(categoryVisibility);
      setCategoryVisibility([...categoryVisibility, addCategoryTitle]);
      console.log(categoryVisibility);
      console.log("Added :", categoryItems);

      let editCatagories = categories;
      editCatagories.splice(editCatagories.length-2, 0, newCategory);
      setCategories(editCatagories);
      editCatagories.forEach((currentCat, index) => {editCatagories[index].data = [];});
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
          editCategoryItems[i].showCompleted = userBoolean;
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
          editCatagories[i].showCompleted = userBoolean;
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

      if(userBoolean == true && categoryCheckedVisibility.indexOf(addCategoryTitle) == -1){
        categoryCheckedVisibility.push(addCategoryTitle);
      }
      else{
        const i =categoryCheckedVisibility.indexOf(addCategoryTitle);
        categoryCheckedVisibility.splice(i, 1);
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
    let newSortingNum;
    if(userText != "" && userText != undefined){
      newSortingNum = parseInt(userText);
    }
    else{
      newSortingNum = editCategoryData.filter((e) => e.category == categoryValue).length;
    }
    if(checked == 'second'){ // Note
      addItem = {
        title: userTitle,
        category: categoryValue,
        sortingNum: parseInt(userText),
        isPinned: userBoolean,
        type: 0,
        makeDate: null
      };

      if(addItem.title == "appCategories" || addItem.title == "appCategoryData" || addItem.title == "appSettings"){ // Note Name check
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
  const updateItem= (updateTitle) => {
    console.log("Updating Item: ", updateTitle);
    const newTitle = userTitle;
    const itemType = categoryData.find((e) => e.title == updateTitle).type;
    let isValid = true;

    if(newTitle == ""){
      setErrorMessage("Item title cannot be empty.");
      isValid = false;
    }
    else if(categoryData.filter(e => e.title == newTitle).length > 0 && newTitle !=updateTitle){
      setErrorMessage("Item title has been taken.");
      isValid = false;
    }
    if(itemType == 0){ // Is Note
      if(newTitle == "appCategories" || newTitle == "appCategoryData" || newTitle == "appSettings"){ // Note Name check
        setErrorMessage("Note title cannot be ", newTitle, ".");
        isValid = false;
      }
      else if(newTitle != updateTitle && categoryData.filter(e => e.title === newTitle+"Pics").length > 0){
        setErrorMessage("Item title has been taken.");
        isValid = false;
      }
    }

    if(isValid){
      const newIsPinned = userBoolean;
      const newCategory = categoryValue;
      const oldItem = categoryData.filter((e) => e.title == updateTitle)[0];
      let newSortingNum;
      if(newCategory == oldItem.category){
        const limit = categoryData.filter((e) => e.category == categoryValue).length -1;
        if(parseInt(userText) < 0){
          newSortingNum = 0;
        }
        else if(parseInt(userText) > limit){
          newSortingNum = limit;
        }
        else{
          newSortingNum = parseInt(userText);
        }
        if(userText2 != null && userText2 != undefined){
          newSortingNum = parseInt(userText2);
        }
      }
      else{
        const limit = categoryData.filter((e) => e.category == categoryValue).length ;
        if(parseInt(userText) < 0){
          newSortingNum = 0;
        }
        else if(parseInt(userText) > limit){
          newSortingNum = limit;
        }
        else{
          newSortingNum = parseInt(userText);
        }
      }


      let sortCategories =[];
      let editCategoryData = categoryData;
      let index = editCategoryData.indexOf(editCategoryData.filter((e) => e.title == updateTitle)[0]);

      editCategoryData[index].title = newTitle;
      editCategoryData[index].isPinned = newIsPinned;
      const oldSortingNum = editCategoryData[index].sortingNum;

      if(oldItem.category !== newCategory){ // Is in different category
        sortCategories.push(oldItem.category);
        sortCategories.push(newCategory);
        const newCat= editCategoryData.filter((e) => e.category == newCategory);
        for(let i=newCat.length-1; i >= newSortingNum; i--){
          const tempIndex = editCategoryData.findIndex((e) => e.category == newCategory && e.sortingNum == i);
          editCategoryData[tempIndex].sortingNum = i+1;
        }

        const oldCategory = editCategoryData[index].category;
        const oldCat= editCategoryData.filter((e) => e.category == oldCategory);
        for(let i=oldCat.length-1; i > oldSortingNum; i--){
          const tempIndex = editCategoryData.findIndex((e) => e.category == oldCategory && e.sortingNum == i);
          editCategoryData[tempIndex].sortingNum = i-1;
        }
      }
      else{ // Is in same category
        sortCategories.push(newCategory);
        console.log("Same");
        if(oldSortingNum > newSortingNum){ // Item was moved up
          for(let i=oldSortingNum-1; i >= newSortingNum; i--){
            const tempIndex = editCategoryData.findIndex((e) => e.category == newCategory && e.sortingNum == i);
            editCategoryData[tempIndex].sortingNum = i+1;
          }
        }
        else{ // Item was moved down
          for(let i=newSortingNum; i > oldSortingNum; i--){
            const tempIndex = editCategoryData.findIndex((e) => e.category == newCategory && e.sortingNum == i);
            editCategoryData[tempIndex].sortingNum = i-1;
          }
        }
      }

      editCategoryData[index].category = newCategory;
      editCategoryData[index].sortingNum = newSortingNum;

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
        sortCategories.push("Notes");
      }
      else{ // List Items
      sortCategories.push("List Items");
      }
      console.log("Sorting: ", sortCategories);
      sortCategories.forEach(function (currentCat) {sortCategory(currentCat)});

      setUpdateModalVisibility(false);
      eraseUserInputs();
    }
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

  // Note Stuff
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
      let title = userArr[0];
      title += "Pics";
      console.log("Picture Added");
      let temp = images;
      temp.push(result.assets[0].uri);
      const tempTitle = userArr[0];
      const tempText = userText;
      const tempArr = userArr;
      const tempCat = categoryValue;
      const tempBool = userBoolean;
      const tempText2 = userText2;
      eraseUserInputs();
      setUserTitle(tempTitle);
      setUserText(tempText);
      setUserArr(tempArr);
      setUserBoolean(tempBool);
      setCategoryValue(tempCat);
      setUserText2(tempText2);
      setImages(temp);
      AsyncStorage.setItem(title, JSON.stringify(temp));

    }
  };
  const displayPics = () => {
    return images.map((name, index) => {
      return(
        <View key={name}>
          <Pressable onPress={() => {setUserInt(index); setChecked('third'); setDeleteConfirmationVisibility(true)}}>
            <Image key={name} source={{ uri: name}} style={styles.pic}/>
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
  const closeNote = () => {
    if(userTitle != userArr[0] || categoryValue != userArr[1] || userBoolean != userArr[2] || parseInt(userText2) != userArr[3]){ // Name has been changed
      /*
      AsyncStorage.setItem(JSON.stringify(userTitle + "Pics"), JSON.stringify(images));
      AsyncStorage.setItem(JSON.stringify(userTitle), userText);
      AsyncStorage.removeItem(userArr[0]);
      AsyncStorage.removeItem(userArr[0] + "Pics");
      let tempData = categoryData;
      const index = tempData.findIndex((e) => e.title == userArr[0]);
      tempData[index].title = userTitle;
      tempData[index].isPinned = userBoolean;
      tempData[index].category = categoryValue;
      setCategoryData(tempData);
      AsyncStorage.setItem('appCategoryData', JSON.stringify(tempData));
      sortCategory(categoryValue);
      sortCategory(userArr[1]);
      sortCategory('Pinned');
      sortCategory('Notes');
      */
      AsyncStorage.setItem(JSON.stringify(userTitle + "Pics"), JSON.stringify(images));
      AsyncStorage.setItem(JSON.stringify(userTitle), userText).then(() =>{eraseUserInputs() });
      setUserText(userText2);
      updateItem(userArr[0]);
    }
    else{
      AsyncStorage.setItem(JSON.stringify(userTitle + "Pics"), JSON.stringify(images));
      AsyncStorage.setItem(JSON.stringify(userTitle), userText).then(() =>{eraseUserInputs() });
    }
    eraseUserInputs()
    setNoteVisibility(false);
    setPicsVisibility(false);
  }

  // Modals
  const noteModal = () => {
    let displayInt = 0;
    if(noteVisibility){
      let limit = categoryData.filter((e) => e.category == categoryValue).length;
      const sortNum = parseInt(userText2);
      console.log("Limit: ", limit, " : ", sortNum);
      if(sortNum < 0){
        setUserText2("0");
      }
      else if(userArr[1] == categoryValue && sortNum >= limit){
        setUserText2(JSON.stringify(limit-1));
      }
      else if(userArr[1] != categoryValue && sortNum > limit){
        setUserText2(JSON.stringify(limit));
      }
      displayInt = userText2;
    }
    return(
      <ScrollView style={styles.noteView}>
        <View style={{display: 'flex',flexDirection: 'row',  alignItems: 'center', marginBottom: 6}}>
          <View style={{flex:0}}>
            <Pressable style={styles.button} onPress={() => {closeNote()}}>
              <Text style={styles.text}>Exit</Text>
            </Pressable>
          </View>
          <View style={{flex:2}}>
            <TextInput style={styles.TextInput} multiline={true} value={userTitle} onChangeText={setUserTitle}/>
          </View>
          <View style={{flex:0}}>
            <Pressable style={styles.button} onPronPress={() => {setUserInt(item.type); setDeleteConfirmationVisibility(true)}}>
              <Text style={styles.text}>Delete</Text>
            </Pressable>
          </View>
        </View>

        <DropDownPicker style={styles.dropDown}
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
          onChangeValue={() => {setUserInt(categoryData.filter((e) => e.category == categoryValue).length); setUserText("" + categoryData.filter((e) => e.category == categoryValue).length)}}
        />

        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6}}>
          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Pin?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean);}}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Index: </Text>
            <TextInput style={styles.TextInput} value={userText2} onChangeText={setUserText2}/>
          </View>
          <Pressable style={styles.button} onPress={() => setPicsVisibility(!picsVisibility)}>
          <Text style={styles.text}>Gallery</Text>
          </Pressable>       
        </View>

        <TextInput style={styles.TextInput} multiline={true} value={userText} onChangeText={setUserText}/>
      </ScrollView>

    );
  }
  const notePicturesModal = () => {
    return(
      <View style={styles.noteView}>
        <View style={{display:'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 6}}>
        <Pressable style={styles.button} onPress={() => {setPicsVisibility(false)}}>
            <Text style={styles.text}>Back</Text>
          </Pressable>
          <Text style={styles.text} multiline={true}>{userTitle} Gallery</Text>
          <Pressable style={styles.button} onPress={() => {closeNote()}}>
            <Text style={styles.text}>Exit</Text>
          </Pressable>
        </View>

        <View style={{marginBottom: 6}}>
          <Pressable style={styles.button} onPress={pickImage}>
              <Text style={styles.text}>Pick an Image from camera roll</Text>
            </Pressable>
          </View>

        <ScrollView contentContainerStyle={styles.picturesContainer}>
          {displayPics()}
        </ScrollView>
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
      if(addItemVisibility && userArr2.length == 0){
        setUserArr2(['first', '0']);
      }
      return(
        <View style={styles.modalView}>
          <Text style={styles.text}>Add List Item</Text>
          <Text style={styles.text}>{errorMessage}</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>List Item</Text>
            <RadioButton 
              value='first'
              status={checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('first')}}
            />
            <Text style={styles.text}>Note Item</Text>
            <RadioButton 
              value='second'
              status={checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('second')}}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Title: </Text>
            <TextInput style={styles.TextInput} multiline={true} value={userTitle} onChangeText={setUserTitle}/>
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Pinned?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
            />
          </View>

          <Text style={styles.text}>Category: </Text>
          <DropDownPicker
          style={styles.TextInput}
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserText(""+categoryData.filter((e) => e.category == categoryValue).length)}}
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Sorting Index: </Text>
            <TextInput style={styles.TextInput} value={userText} onChangeText={setUserText}/>
          </View>

          <Pressable
              style={[styles.button]}
              onPress={() => {addItem()}}>
              <Text style={styles.text}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button]}
              onPress={() => {setAddItemVisibility(!addItemVisibility); eraseUserInputs();}}>
              <Text style={styles.text}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
    else{ // Note Item
      return(
        <View style={styles.modalView}>
          <Text style={styles.text}>Add Note</Text>
          <Text style={styles.text}>{errorMessage}</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>List Item</Text>
            <RadioButton 
              value='first'
              status={checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('first')}}
            />
            <Text style={styles.text}>Note Item</Text>
            <RadioButton 
              value='second'
              status={checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => {setChecked('second')}}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Title: </Text>
            <TextInput style={styles.TextInput} multiline={true} value={userTitle} onChangeText={setUserTitle}/>
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Pinned?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean); console.log(userBoolean)}}
            />
            </View>

          <Text style={styles.text}>Category: </Text>
          <DropDownPicker
            style={styles.TextInput}
            baseColor={textColor}
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserText(""+categoryData.filter((e) => e.category == categoryValue).length)}}
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Sorting Index: </Text>
            <TextInput style={styles.TextInput} value={userText} onChangeText={setUserText}/>
          </View>

          <Pressable
              style={[styles.button]}
              onPress={() => {addItem()}}>
              <Text style={styles.text}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button]}
              onPress={() => {setAddItemVisibility(!addItemVisibility); eraseUserInputs();}}>
              <Text style={styles.text}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
  }
  const updateModal = () => { // UserBoolean true: category false: item
    if(checked != 'first'){ // Category
      return(
        <View style={styles.modalView}>
          <Text style={styles.text}>Update Category: {userArr[0]}</Text>
          <Text style={styles.text}>{errorMessage}</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Title: </Text>
            <TextInput style={styles.TextInput} value={userTitle} placeholder={userArr[0]} onChangeText={setUserTitle}/>
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Display Completed Items: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean);}}
            />
          </View>

          <Pressable
              style={[styles.button]}
              onPress={() => {updateCategory(userArr[0])}}>
              <Text style={styles.text}>Update</Text>
            </Pressable>

            <Pressable
              style={[styles.button]}
              onPress={() =>{ deleteCategory(); eraseUserInputs(); setUpdateModalVisibility(!updateModalVisibility); }}>
              <Text style={styles.text}>Delete</Text>
            </Pressable>

            <Pressable
              style={[styles.button]}
              onPress={() => {setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
              <Text style={styles.text}>Cancel</Text>
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
        let limit = categoryData.filter((e) => e.category == categoryValue && !e.completeDate).length -1;
        if(categoryValue != userArr[0].category){
          limit = categoryData.filter((e) => e.category == categoryValue && !e.completeDate).length;
        }
        if(parseInt(userText) < 0){
          setUserText("" + 0);
        }
        else if(parseInt(userText) > limit){
          setUserText("" + limit);
        }
      }
      return(
        <View style={styles.modalView}>
          <Text style={styles.text}>Update {type} Item: {title}</Text>
          <Text>{errorMessage}</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Title: </Text>
            <TextInput style={styles.TextInput} value={userTitle} placeholder={title} onChangeText={setUserTitle}/>
          </View>

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Pinned?: </Text>
            <Checkbox 
              status={userBoolean ? 'checked' : 'unchecked'}
              onPress={() => {setUserBoolean(!userBoolean);}}
            />
          </View>
          
          <Text style={styles.text}>Category: </Text>
          <DropDownPicker
          style={styles.TextInput}
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            setItems={setCategoryItems}
            onChangeValue={() => {setUserInt(categoryData.filter((e) => e.category == categoryValue).length); setUserText("" + categoryData.filter((e) => e.category == categoryValue).length)}}
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Sorting Index: </Text>
            <TextInput style={styles.TextInput} value={userText} onChangeText={setUserText}/>
          </View>

          <Pressable
              style={[styles.button]}
              onPress={() => {updateItem(title)}}>
              <Text style={styles.textStyle}>Update Item</Text>
          </Pressable>

          <Pressable
            style={[styles.button]}
            onPress={() => {deleteItem(); setUpdateModalVisibility(!updateModalVisibility); eraseUserInputs();}}>
            <Text style={styles.textStyle}>Delete</Text>
          </Pressable>

          <Pressable
            style={[styles.button]}
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
          <Text style={styles.text}>Delete Category: {userTitle}: {userText}?</Text>
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
          <Text style={styles.text}>Delete Picture?</Text>
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
         <Text style={styles.text}>Delete {type}: {userTitle}?</Text>
          <Text>{errorMessage}</Text>
  
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {setNoteVisibility(false); deleteItem()}}>
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
  }
  const settingsModal = () => {
    if(settingsVisibility){
      if(userText == null|| userText == undefined){
        console.log(settings.deleteAfter);
        setUserText(JSON.stringify(settings.deleteAfter));
        setCategoryValue(settings.theme);
      }
    }
    return(
      <View style={styles.modalView}>
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
          <Text style={styles.text}>Settings</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.text}>Delete Completed After </Text>
          <TextInput style={styles.TextInput} value={userText} onChangeText={setUserText}/>
          <Text style={styles.text}> Days</Text>
        </View>

        <Text style={styles.text}>Theme</Text>
        <DropDownPicker style={styles.TextInput}
          open={categoryOpen}
          value={themeValue}
          items={themes}
          setOpen={setCategoryOpen}
          setValue={setThemeValue}
          setItems={setThemes}
          onChangeValue={() => {console.log(themeValue)}}
        />
      
        <View>
          
        </View>

        <Pressable style={styles.button} onPress={() => {closeSettings()}}>
          <Text style={styles.text}>Confirm</Text>
        </Pressable>
      </View>
    );
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
  const eraseUserInputs = () => {
    console.log("Clear");
    setErrorMessage(null);
    setUserTitle(null);
    setUserText(null);
    setUserText2(null);
    setChecked('first');
    setUserInt(0);
    setUserBoolean(false);
    setCategoryOpen(false);
    setCategoryValue(null);    
    setUserArr([]);
    setImages([]);
    setUserArr2([]);
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
  const closeSettings = () => {
    console.log('Updating Settings');
    let deleteAfter = parseInt(userText);
    if(deleteAfter < 0){
      deleteAfter = 0;
    }
    if(settings.deleteAfter != deleteAfter){
      let temp = settings;
      temp.deleteAfter = deleteAfter;
      setSettings(temp);
      AsyncStorage.setItem('appSettings', JSON.stringify(temp));
    }
    if(settings.theme != themeValue){
      let temp = settings;
      temp.theme = themeValue;
      setSettings(temp);
      AsyncStorage.setItem('appSettings', JSON.stringify(temp));
    }

    setSettingsVisibility(false);
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
            sortNum: 0,
            show: true,
            showCompleted: false
          },
          {
            title: "List Items",
            color: "List Items",
            data: [],
            sortNum: 1,
            show: false,
            showCompleted: false
          },
          {
            title: "Notes",
            color: "Notes",
            data: [],
            sortNum: 2,
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

    value = AsyncStorage.getItem('appSettings').then((value) => {
      if(!value){
        console.log("Making new Settings key");
        const tempAppSettings = {
          theme: 'Dark',
          deleteAfter: 30,
          userThemes: []
        };
        setSettings(tempAppSettings);
        setThemeValue('Dark');
        AsyncStorage.setItem('appSettings', JSON.stringify(tempAppSettings));
      }
      else{
        setSettings(JSON.parse(value));
        if(settings.length == 0){
          const userThemes = JSON.parse(value).userThemes;
          for(let i=0; i< userThemes.length -1; i++){
            setThemes(themes => [...themes, userThemes[i]]);
          }
        }
        setThemeValue(JSON.parse(value).theme);
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
          <View style={{flex:0,}}>
          <Pressable style={styles.button }  onPress={() => {setSettingsVisibility(true)}}>
            <Text style={styles.text}>Settings</Text>
          </Pressable>
          </View>
          <View style={{flex:1, }}></View>
          <View style={{flex:3, }}>
          <Text style={styles.text}>Idea Manager</Text>
          </View>
          <View style={{flex:2, }}></View>
          <View style={{flex:0}}>
          <Pressable style={styles.button}  onPress={() => {setAddCategoryVisibility(true)}}>
            <Text style={styles.text}>+</Text>
          </Pressable>
          </View>
        </View>

        <SectionList
          sections={categories}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => {
            let show = categoryVisibility.includes(currentCategory);
            // Complete date YYYY-MM-DD
            if('completeDate' in item && item.completeDate != undefined){
              let completeDate = item.completeDate;
              let year = parseInt(completeDate.substr(0, 4));
              completeDate = completeDate.slice(5);
              let month = parseInt(completeDate.substr(0, completeDate.search('-')));
              completeDate = completeDate.slice(completeDate.search('-')+1);
              let day = parseInt(completeDate);
              completeDate = new Date(""+ year+ "-"+ month+ "-"+ day);
              let deleteAfter;
              let deleteDate;
              AsyncStorage.getItem('appSettings').then((value) => {
                if(!value){
                  const tempAppSettings = {
                    deleteAfter: 30
                  };
                  deleteAfter = 30;
                  AsyncStorage.setItem('appSettings', JSON.stringify(tempAppSettings));
                }
                else{
                  deleteAfter = JSON.parse(value).deleteAfter;
                }
                deleteDate = new Date();
                deleteDate.setDate(completeDate + deleteAfter);
                if(deleteDate <= new Date()){
                  console.log("Deleting ", item.title);
                  setUserTitle(item.title);
                  deleteItem();
                  show = false;
                }

              });
            }
            itemSortNums.push({title: item.title, num: JSON.stringify(item.sortingNum)});
            let style = [styles.item];
            if(show){
              const showCompleted = categoryCheckedVisibility.includes(currentCategory);
              if(showCompleted){
                if(currentCategory == item.category && item.sortingNum == categoryData.filter((e) => e.category == item.category).length -1){
                  style.push(styles.endBorder);
                }
                else{
                  style.push(styles.eraseBottomBorder);
                }

                if(item.type == 0){ // Note
                  return (
                    <View style={style}>
                      <Pressable onPress={() => {setUserText2(JSON.stringify(item.sortingNum)); setUserTitle(item.title); setUserInt(item.sortingNum); setUserBoolean(item.isPinned); setUserArr([item.title, item.category, item.isPinned, item.sortingNum]); setCategoryValue(item.category); displayNote(item.title)}}>
                        <Text multiline='true' style={styles.text}>{item.title}</Text>
                      </Pressable>
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
                        <Text multiline='true' style={styles.text}>{item.title}</Text>
                      </Pressable>
                  </View>
                  );
                }
              }
              else{
                const catIndex = categories.findIndex((e) => e.title == currentCategory);
                const catData = categories[catIndex].data;
                let lastIndex = 0;
                for(let i=catData.length-1; i != 0; i--){
                  if(catData[i].completeDate == undefined){
                    lastIndex = catData[i].sortingNum;
                    break;
                  }
                }
                if(item.sortingNum == lastIndex){
                  style.push(styles.endBorder);
                }
                else{
                  style.push(styles.eraseBottomBorder);
                }

                if(item.type == 0){ // Note
                  return (
                    <View style={style}>
                      <Pressable onPress={() => {setUserText2(JSON.stringify(item.sortingNum)); setUserTitle(item.title); setUserInt(item.sortingNum); setUserBoolean(item.isPinned); setUserArr([item.title, item.category, item.isPinned, item.sortingNum]); setCategoryValue(item.category); displayNote(item.title)}}>
                        <Text multiline='true' style={styles.text}>{item.title}</Text>
                      </Pressable>
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
                        <Text multiline='true' style={styles.text}>{item.title}</Text>
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
              else{
                style.push(styles.eraseBottomBorder);
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
                  <Pressable style={styles.button} onPress={() => {setUserTitle(title); setUserBoolean(true); setAddItemVisibility(true)}}>
                    <Text style={styles.text}>+</Text>
                  </Pressable>
                </View>
              );
            }
            if(title == "List Items"){
              if(!show || categoryData.find((e) => e.type !== 0 && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.type !== 0) == undefined)){
                style.push(styles.endBorder);
              }
              else{
                style.push(styles.eraseBottomBorder);
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
                  <Pressable style={styles.button} onPress={() => {setAddItemVisibility(true)}}>
                    <Text style={styles.text}>+</Text>
                  </Pressable>
                </View>
                );
            }
            else if(title == "Notes"){
              if(!show || categoryData.find((e) => e.type == 0 && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.type == 0) == undefined)){
                style.push(styles.endBorder);
              }
              else{
                style.push(styles.eraseBottomBorder);
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
                  <Pressable style={styles.button} onPress={() => {setChecked('second'); setUserInt(0); setAddItemVisibility(true)}}>
                    <Text style={styles.text}>+</Text>
                  </Pressable>
                </View>
                );
            }
            if(!show || categoryData.find((e) => e.category == title && e.completeDate == undefined) == undefined  || (showCompleted && categoryData.find((e) => e.category == title) == undefined)){
              style.push(styles.endBorder);
            }
            else{
              style.push(styles.eraseBottomBorder);
            }
            return(
              <View style={style}>
                  <View style={styles.checkboxContainer}>
                  <Pressable onPress={() => {setUserTitle(title); setUserText(color); setUserArr([title, color, showCompleted]); setUserBoolean(showCompleted); setChecked('second');  setUpdateModalVisibility(true)}}>
                    <Text multiline='true' style={styles.text}>{title}</Text>
                  </Pressable>
                    <Checkbox 
                    status={categoryVisibility.includes(title) ? 'checked' : 'unchecked'}
                    onPress={() => {toggleCategoryVisibility(title);}}
                    />
                  </View>
                  <Pressable style={styles.button} onPress={() => {setCategoryValue(title); setUserText(""+categoryData.filter((e) => e.category == title).length); setAddItemVisibility(true)}}>
                    <Text style={styles.text}>+</Text>
                  </Pressable>
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
              <Text style={styles.text}>Add Category</Text>
              <Text style={styles.text}>{errorMessage}</Text>
              <View style={styles.checkboxContainer}>
                <Text style={styles.text}>Title: </Text>
                <TextInput style={styles.TextInput} multiline={true} value={userTitle} onChangeText={setUserTitle}/>
              </View>
              <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => addCategory()}>
                  <Text style={styles.text}>Add Category</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {setAddCategoryVisibility(!addCategoryVisibility); eraseUserInputs();}}>
                  <Text style={styles.text}>Cancel</Text>
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

        {/* Display Settings*/}
        <Modal 
          animationType='slide'
          transparent={true}
          visible={settingsVisibility}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            eraseUserInputs();
            setSettingsVisibility(!settingsVisibility);
          }}
        >
          <View style={styles.centeredView}>
            {settingsModal()}
          </View>
        </Modal>

      </SafeAreaView>
  );
  }
}
