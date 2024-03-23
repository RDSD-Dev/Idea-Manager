import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert, FlatList, TextComponent, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

import Category from './Category';

export default function HomePage(props) {
  const navigation = useNavigation();
  const db = SQLite.openDatabase('ideaManager.db');
  const table = "listItems";
  const [allCategories, setAllCategories] = useState([]); // Stores HomePageCategories from AsyncStorage
  let cats = [];
  const [shouldLoadData, setShouldLoadData] = useState(true);
  let data = [];
  let cat = "";

  useEffect(() => {
    console.log("Use Effect");
  }, []);

  const displayCategories = () => {
    return allCategories.forEach((title) => {
      return(
        <Text>{title[0]}</Text>
      );
    })
  }

  if(shouldLoadData){
    console.log("Loading Data");
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
            data.push(currentObject);
          },
          (txObj, error) => console.log(error)
      );
    });

    //Store Categories
    let value = AsyncStorage.getItem('appCategories').then((value) => {
      if(!value){
        console.log('Making New Lists Key');
        const temArr = [
          ["Pinned", "Pinned"],
          ["List Items", "List Items"],
          ["Notes", "Notes"]
        ];
        console.log(temArr);
        setAllCategories(temArr);
        AsyncStorage.setItem('appCategories', JSON.stringify(temArr));
      }
      else{
        console.log("Categories: " + JSON.parse(value));
        setAllCategories(JSON.parse(value));
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

    console.log("All Data: " + data);
    if(allCategories.length >= 3){
      setShouldLoadData(false);
    }
  }

  return(
    <View>
        <Text>{"\n"}Header{"\n"}</Text>
        <Text>{allCategories[0][0]}</Text>

    </View>
);
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#A9A9A9',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  