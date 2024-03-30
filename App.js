import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton, Checkbox } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [shouldLoadData, setShouldLoadData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [addCategoryVisibility, setAddCategoryVisibility] = useState(false); // addCategory, 
  const [addItemVisibility, setAddItemVisibility] = useState(false); // addItem, 
  const [deleteConfirmationVisibility, setDeleteConfirmationVisibility] = useState(false); // addCategory, 
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [userTitle, setUserTitle] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const [userBoolean, setUserBoolean] = useState(false);
  const [checked, setChecked] = React.useState('first');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);

  useEffect(() => {
    console.log("Use Effect");


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
        data: [{}]
      }
      let editCatagories = categories;
      editCatagories.splice(editCatagories.length-2, 0, newCategory);

      setCategories(editCatagories);
      AsyncStorage.setItem('appCategories',JSON.stringify(editCatagories));
      setAddCategoryVisibility(!addCategoryVisibility)
    }
  }

  const updateCategory = () => {

  }

  const deleteCategory = (category) => {
    changeUserInput();
    console.log("Delete Category: " + category);
    let editCatagories = categories;
    const obj = editCatagories.filter((item) => item.title == category);
    const index = categories.indexOf(obj[0]);
    editCatagories.splice(index, 1);

    AsyncStorage.setItem('appCategories', JSON.stringify(editCatagories));
    setDeleteConfirmationVisibility(false);
  }
  
  const addListItem = () => { // Title: userTitle, Category: categoryValue, isPinned: userBoolean
    let isValid = true;
    let addItem = {
      title: userTitle,
      category: categoryValue,
      sortingNum: 0,
      isPinned: userBoolean,
      type: 1,
      remakeNum: 0,
      makeDate: null
    };

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

    if(isValid){
      console.log("Add Item");
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
        if(addItem.type == 0){ // Note

        }
        else{ // List Item
          tempCategories[tempCategories.length-2].data.push(addItem);
        }
      }
      AsyncStorage.setItem('appCategoriesData', JSON.stringify(tempData));
      setAddItemVisibility(false);
    }
  }

  const addNote= () => {
    console.log(category);
  }

  const changeUserInput = (textArr = ["", "", 'first', false]) => {
    setErrorMessage("");
    setUserTitle(textArr[0]);
    setUserText(textArr[1]);
    setChecked(textArr[2]);
    setUserBoolean(textArr[3]);
    setCategoryOpen(false);
    setCategoryValue(null);

    let categoryItemSetting = [];
    categories.forEach(function (element, index ){
      console.log(element.title + ":");
      if(index == 0 || index == categories.length-2 || index == categories.length-1){
        // Doesn't need to be seen
      }
      else{
        console.log(element.title);
        categoryItemSetting.push({label: element.title, value: element.title});
      }
      });
      setCategoryItems(categoryItemSetting);
    
  }

  const addItemModal = () => {
    if(checked == 'first'){
      return(
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add Item</Text>
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
              onPress={() => addListItem()}>
              <Text style={styles.textStyle}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setAddItemVisibility(!addItemVisibility)}>
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
              onPress={() => addNote()}>
              <Text style={styles.textStyle}>Add Note</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setAddItemVisibility(!addItemVisibility)}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
      );
    }
  }

  const sortData = (dataArr) => {
    console.log("Sorting");
    let categoryNames = [];
    for(let i=0; i<categories.length; i++){
      categoryNames.push(categories[i].title);
    }

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
      console.log("Index: ", index);
      if(index > 0){
        tempCategories[index].data.push(dataArr[i]);
      }
    }
    setCategories(tempCategories);
  }

  if(shouldLoadData){
    console.log("Loading Data");
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

    value = AsyncStorage.getItem('appCategoriesData').then((value) => {
      if(!value){
        console.log('Making New Data Key');
        AsyncStorage.setItem('appCategoriesData', JSON.stringify([]));
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
                  onPress={() => setAddCategoryVisibility(!addCategoryVisibility)}>
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
            setAddCategoryVisibility(!addItemVisibility);
          }}
        >
          <View style={styles.centeredView}>

              {addItemModal()}

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
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Delete {userTitle}: {userText}?</Text>
              <Text>{errorMessage}</Text>

              <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => deleteCategory(userText)}>
                  <Text style={styles.textStyle}>Delete</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setDeleteConfirmationVisibility(!deleteConfirmationVisibility)}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
              </View>
            </View>
        </Modal>

        <Text>{"\n"}Header{"\n"}</Text>
        <Button title='+' onPress={() => {changeUserInput();  setAddCategoryVisibility(true)}}/>

        <SectionList 
          sections={categories}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => (
            <View>
              <Text>{item.title}</Text>
              <Text>{item.type}</Text>
            </View>
          )}
          renderSectionHeader={({section: {title}}) => {
            if(title == "Pinned" || title == "List Items" || title == "Notes"){
              return(
                <View>
                <Text>{title}</Text>
                <Button title='+' onPress={() => {changeUserInput(); setAddItemVisibility(true)}}/>
                </View>
                );
            }
            return(
              <View>
                <Text>{title}</Text>
                <Button title='+' onPress={() => {changeUserInput(); setCategoryValue(title); setAddItemVisibility(true)}}/>
                <Button title='Delete' onPress={() =>{ changeUserInput(["Category", title]); setDeleteConfirmationVisibility(true)}}/>
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