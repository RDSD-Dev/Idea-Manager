import { StyleSheet, Text, View, SafeAreaView, SectionList, Pressable, TextInput, Button, ScrollView, Alert, FlatList, TextComponent, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

export default function HomePage(props) {
  const navigation = useNavigation();
  const db = SQLite.openDatabase('ideaManager.db');
  const table = "listItems";
  const [expandedSections, setExpandedSections] = useState(new Set());

  const [categories, setCategories] = useState([]); // Stores HomePageCategories from AsyncStorage
  const [shouldLoadData, setShouldLoadData] = useState(true);
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

  const addItem = (category, type) => {
    console.log(category);
  }

  if(shouldLoadData){
    console.log("Loading Data");
    //Store Categories
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
        <Text>{"\n"}Header{"\n"}</Text>
        <Button title='+' onPress={() => console.log("Add Category")}/>
        <SectionList 
          sections={categories}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => (
            <Text>{items[item]}</Text>
          )}
          renderSectionHeader={({section: {title}}) => (
            <View>
            <Text>{title}</Text>
            <Button title='+' onPress={() => addItem(title)}/>
            </View>
          )}
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
  });
  