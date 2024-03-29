import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton, Checkbox } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('IdeaManager.db');

export default function App() {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [shouldLoadData, setShouldLoadData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [addCategoryVisibility, setAddCategoryVisibility] = useState(false); // addCategory, 
  const [addItemVisibility, setAddItemVisibility] = useState(false); // addItem, 
  const [deleteConfirmationVisibility, setDeleteConfirmationVisibility] = useState(false); // addCategory, 
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [addInput, setAddInput] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const [userBoolean, setUserBoolean] = useState(false);
  const [checked, setChecked] = React.useState('first');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const table = "listItems";
  let items = [];

  useEffect(() => {
    console.log("Use Effect");


  }, []);

  const sortData = () =>{
    console.log("Raw Data: ", items);
    let sortingArr = categories;
    // Iterates though each category
    for(var i = 0; i<categories.length; i++){
      // Gets all the data that belongs in the current category
      let tempArr =  [];
      if(categories[i].title == "Pinned"){
        tempArr = (items.filter((item) => item.isPinned == true));
      }
      else if(categories[i].title == "List Items"){
        tempArr = (items.filter((item) => item.type > 0));
      }
      else if(categories[i].title == "Notes"){
        tempArr = (items.filter((item) => item.type == 0));
      }
      else{
        tempArr = (items.filter((item) => item.category == categories[i].title));
      }
      let sortedArr =[];
      // Iterate though each object for the current category
      for(var t = 0; t<tempArr.length; t++){
        sortedArr[t] = tempArr.indexOf(tempArr.filter((item) => item.sortNum == t));
      }
      sortingArr[i].items = sortedArr;
      console.log("Processed: ",categories[i].data);

    }
    setCategories(sortingArr);
  }

  const addCategory = () => {
    let isValid = true;
    // Check if Title is valid
    const result = categories.filter((item) => item.title == addInput);
    if(addInput.length <= 0){
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
      console.log("Made category: " + addInput);
    }

    if(isValid){
      const newCategory = {
        title: addInput,
        color: userText,
        data: [{}]
      }
      let editCatagories = categories;
      const noteCategory = editCatagories[editCatagories.length-1];
      editCatagories.pop();
      const ListCategory = editCatagories[editCatagories.length-1];
      editCatagories.pop();
      editCatagories.push(newCategory);
      editCatagories.push(noteCategory);
      editCatagories.push(ListCategory);

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
  

  const addListItem = () => { // Title: addInput, Category: categoryValue, isPinned: userBoolean
    let isValid = true;
    const addTitle = addInput;
    const addCategory = categoryValue;
    const addIsPinned = userBoolean;
    const addType = 1;
    const addRemakeNum = 0;
    const today = new Date();
    const addToday = (today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate());
    let addSortingNum = 0;
    if(addCategory != "" || addCategory != null){
      for(var i = 1; i<categories.length -2; i++){
        if(categories[i].title == addCategory){
          const tempArr = (items.filter((item) => item.category == categories[i].title));
          addSortingNum = tempArr.length;
        }
      }
    }

    if(addTitle == ""){
      setErrorMessage("Item title cannot be empty.");
      isValid = false;
    }

    if(isValid){
      console.log("ADD");
      // 'INSERT INTO ' + table + ' (title, category, sortNum, isPinned, makeDate, type, remakeNum) values (?, ?, ?, ?, ?, ?, ?)'
      db.transaction(tx => {
        tx.executeSql('INSERT INTO ' + table + ' (title, category, sortNum, isPinned, makeDate, type, remakeNum) values (?, ?, ?, ?, ?, ?, ?) ',  
        [addTitle, addCategory, addSortingNum, addIsPinned, addToday, addType, addRemakeNum],
        (txObj, resultSet) => {
          console.log("Added: ", resultSet.insertId);
          const currentObject = {
            title: addTitle,
            id: resultSet.insertId,
            type: addType,
            category: addCategory,
            sortNum: addSortingNum,
            isPinned: addIsPinned,
            makeDate: addToday,
            completeDate: null,
            remakeNum: addRemakeNum
          }
          items.push(currentObject);
          sortData();
          changeUserInput();
          setAddItemVisibility(false);
        },
        (txObj, error) => console.log(error)
    );
      });
    }
  }

  const addNote= () => {
    console.log(category);
  }

  const changeUserInput = (textArr = ["", "", 'first', false]) => {
    setErrorMessage("");
    setAddInput(textArr[0]);
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
          <TextInput value={addInput} onChangeText={setAddInput}/>
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
          <TextInput value={addInput} onChangeText={setAddInput}/>
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
            data: [{}],
          },
          {
            title: "List Items",
            color: "List Items",
            data: [{}],
          },
          {
            title: "Notes",
            color: "Notes",
            data: [{}],
          },
        ];
        console.log("Temp: " + temArr.length);
        setCategories(temArr);
        AsyncStorage.setItem('appCategories', JSON.stringify(temArr));
      }
      else{
        setCategories(JSON.parse(value));
      }
    }); 

    // Store note titles as object
    value = AsyncStorage.getItem('appNotes').then((value) => {
      if(value != undefined){
        JSON.parse(value).forEach((note) => {
          const currentObject = {
            title: note[0],
            type: 0,
            category: note[1],
            sortNum: note[2],
            isPinned: note[3],
            makeDate: note[4],
            editDate: note[5]
          };
          data.push(currentObject);
        });
      }
    });

    // Make Table if it doesn't exist IF NOT EXISTS


    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+' (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, makeDate DATE, dueDate DATETIME, completeDate DATE, type INTEGER, remakeNum INTEGER, category TEXT, sortNum INTEGER, isPinned BOOLEAN)', [],
      (txObj, resultSet) => {
        console.log("Make: ", resultSet);r
      });
    });

    db.transaction(tx => {
      tx.executeSql('SELECT * FROM ' + table,  [],
      (txObj, resultSet) => {
        console.log("Get: ", resultSet.rows._array[0].title);
        const currentItem = resultSet.rows._array[0];
        const currentObject = {
          title: currentItem.title,
          id: currentItem.id,
          type: currentItem.type,
          category: currentItem.category,
          sortNum: currentItem.sortNum,
          isPinned: currentItem.isPinned,
          makeDate: currentItem.makeDate,
          completeDate: currentItem.completeDate,
          remakeNum: currentItem.remakeNum
        }
        console.log("Data: Gotten" );
        items.push(currentObject);
        sortData();
      },
      (txObj, error) => console.log(error)
  );
    })
    
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
              <TextInput value={addInput} onChangeText={setAddInput}/>
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
              <Text style={styles.modalText}>Delete {addInput}: {userText}?</Text>
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
            <Text>{items[item]}</Text>
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