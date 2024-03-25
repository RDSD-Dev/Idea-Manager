import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [shouldLoadData, setShouldLoadData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [addCategoryVisibility, setAddCategoryVisibility] = useState(false); // addCategory, 
  const [deleteConfirmationVisibility, setDeleteConfirmationVisibility] = useState(false); // addCategory, 
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [addInput, setAddInput] = useState(undefined);
  const [userText, setUserText] = useState(undefined);
  const db = SQLite.openDatabase('ideaManager.db');
  const table = "listItems";
  let items = [];

  useEffect(() => {
    console.log("Use Effect");
  }, []);

  const sortData = () =>{
    let sortingArr = categories;
    // Iterates though each category
    for(var i = 0; i<categories.length; i++){
      // Gets all the data that belongs in the current category
      let tempArr =  [];
      if(categories[i] == "Pinned"){
        tempArr = (items.filter((item) => item.isPinned == true));
      }
      else if(categories[i] == "List Items"){
        tempArr = (items.filter((item) => item.type > 0));
      }
      else if(categories[i] == "Notes"){
        tempArr = (items.filter((item) => item.category == 0));
      }
      else{
        tempArr = (items.filter((item) => item.category == categories[i]));
      }
      let sortedArr =[];
      // Iterate though each object for the current category
      for(var t = 0; t<tempArr.length; t++){
        sortedArr[t] = tempArr.indexOf(tempArr.filter((item) => item.sortNum == t));
      }
      sortingArr[i].items = sortedArr;
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
  

  const addItem = (category, type) => {
    console.log(category);
  }

  const changeUserInput = (textArr = ["", ""]) => {
    setErrorMessage("");
    setAddInput(textArr[0]);
    setUserText(textArr[1]);
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
        console.log("Categories: ");
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

    // Make Table if it doesn't exist
    db.transaction(tx => {
      // Dates are Y-M-D
      tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+' (id INTEGER PRIMARY KEY AUTOINCREMENT, name VarChar(64), makeDate Date, completeDate Date, type Int, remakeNum int, category VarChar(32), sortNum Int, isPinned Boolean)', []);
    });

    // Store list items as object
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM ' + table,  [],
          (txObj, resultSet) => {
            const currentItem = resultSet.rows._array;
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
            items.push(currentObject);
          },
          (txObj, error) => console.log(error)
      );
    });

    if(categories.length >= 3){
      console.log("All Data: " + items);
      setShouldLoadData(false);
      sortData();
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
                <Button title='+' onPress={() => addItem(title)}/>
                </View>
                );
            }
            return(
              <View>
              <Text>{title}</Text>
              <Button title='+' onPress={() => addItem(title)}/>
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