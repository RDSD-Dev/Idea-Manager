import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert, FlatList } from 'react-native';
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
  let data = [];
  
  
  if(allCategories == null || allCategories.length <= 0){
    const value = AsyncStorage.getItem('HomePageCategories').then((value) => {
        if(!value){
            // New key made
          console.log('Making New Lists Key');
          const temArr = [];
          AsyncStorage.setItem('HomePageCategories', JSON.stringify(temArr));
          setAllCategories(JSON.parse(temArr));
        }
        else{
            // Save Categories
          if(value != undefined){
            setAllCategories(JSON.parse(value));
          }
        }
      });
  }

    if(data.length() <= 0){
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

      // Store note titles as object
      const value = AsyncStorage.getItem('appNotes').then((value) => {
        if(!value){
          console.log('Making New Lists Key');
          const temArr = [];
          AsyncStorage.setItem('appNotes', JSON.stringify(temArr));
        }
        else{
          if(value != undefined){
            const notes = JSON.parse(value);
            notes.forEach((note) => {
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
        }
        
      });
    }



  const displayCategories = () => {
    return allCategories.map(title => {
        return(
            <Category category={title} color={title.color}/>
        );
    });
  }

    return(
        <ScrollView>
            <Text>Header</Text>
            <FlatList 
              data={data}
              renderItem={() => {}}
            />
            {displayCategories()}
        </ScrollView>
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
  