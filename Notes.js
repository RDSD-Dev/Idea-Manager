import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

export default function Notes(props) {
  const navigation = useNavigation();
  const [noteArr, setNoteArr] = useState([]);

  const loadData = navigation.addListener('focus', () => {
    const value = AsyncStorage.getItem('Notes').then((value) => {
        if(!value){
          console.log('Making New Lists Key');
          const temArr = [];
          AsyncStorage.setItem('Notes', JSON.stringify(temArr));
        }
        else{
          if(value != undefined){
            setNoteArr(JSON.parse(value));
          }
        }
        
      });
    //ToDoLists(props);
});

const navigateNote = (title) => {

}

const navigateAddNote = () => {
  console.log("Navigate: Add List");
  navigation.navigate("Add Note");
}

const navigateUpdateNote = (title) => {

}

const deleteNote = (title) => {
  console.log("Delete: ", title);
  const db = SQLite.openDatabase('Note.db');
  db.transaction(tx => {
      // Dates are Y-M-D
      tx.executeSql('DROP TABLE IF EXISTS '+title, []);
  });

  const index = noteArr.indexOf(title);
  if(index > -1){
    setNoteArr(noteArr.splice(index, 1));
      AsyncStorage.setItem('Notes', JSON.stringify(noteArr));
      navigation.setOptions({title: "Notes"});
      const value = AsyncStorage.getItem('Notes').then((value) => {
        if(value != undefined){
          setNoteArr(JSON.parse(value));
        }
      });
  }
}

const DeleteConfirmation = (title) => {
  Alert.alert("Delete Confirmation", "Are you sure you'd like to delete this?", [
      {
          text: 'Delete', onPress: () => deleteNote(title),
      },
      {
          text: 'Cancel', onPress: () => {console.log("Cancel Delete")},
      }
  ]);
}

const moveNoteUp = (name) => {
  console.log("Move Up: ", name)
  const current = noteArr.indexOf(name);
  let tempArr = [];
  for(let i=0; i< noteArr.length; i++){
      if(i+1 == current){
          tempArr.push(noteArr[current]);
          tempArr.push(noteArr[i]);
          i++;
      }
      else{
          tempArr.push(noteArr[i]);
      }
  }
  setNoteArr(tempArr);
  AsyncStorage.setItem('Notes', JSON.stringify(tempArr));
  
}

const moveNoteDown = (name) => {
  console.log("Move Down: ", name)
  const current = noteArr.indexOf(name);
  let tempArr = [];
  for(let i=0; i< noteArr.length; i++){
      if(i == current && i != noteArr.length-1){
          tempArr.push(noteArr[i+1]);
          tempArr.push(noteArr[current]);
          i++;
      }
      else{
          tempArr.push(noteArr[i]);
      }
  }
  setNoteArr(tempArr);
  AsyncStorage.setItem('Notes', JSON.stringify(tempArr));
}

  const displayNotes = () => {
    return noteArr.map(title => {
      return(
          <View key={title}>
              <Text >{title}</Text>
              <Button title='Up' onPress={() => moveNoteUp(title)}/>
              <Button title='Down' onPress={() => moveNoteDown(title)}/>
              <Button title='Delete' onPress={() => DeleteConfirmation(title)}/>
          </View>
      );
    });
  }

  if(noteArr.length <= 0){
    const value = AsyncStorage.getItem('Notes').then((value) => {
         if(!value){
             console.log('Making New Lists Key');
             const noteArr = [];
            AsyncStorage.setItem('Notes', JSON.stringify(noteArr));
        }
        else{
            if(value != undefined){
            setNoteArr(JSON.parse(value));
            }
         }
     });
}
else{
    return (
        <ScrollView>
            <Button title="+" onPress={() => navigateAddNote()}/>
            <View>
              {displayNotes()}
            </View>
        </ScrollView>
    );
}

    return(
      <ScrollView>
        <Button title="+" onPress={() => navigateAddNote()}/>
        <View>
          {displayNotes()}
        </View>
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
  