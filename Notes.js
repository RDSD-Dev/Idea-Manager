import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Notes(props) {
  const navigation = useNavigation();
  const [noteArr, setNoteArr] = useState([]);

  const loadData = navigation.addListener('focus', () => {
    console.log("Focus");
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

const navigateAddNote = () => {
  console.log("Navigate: Add List");
  navigation.navigate("Add Note");
}

const deleteNote = (title) => {
  console.log("Delete: ", title);
  const db = SQLite.openDatabase('Note.db');
  db.transaction(tx => {
      // Dates are Y-M-D
      tx.executeSql('DROP TABLE IF EXISTS '+title, []);
  });

  const DeleteConfirmation = (title) => {
    Alert.alert("Delete Confirmation", "Are you sure you'd like to delete this?", [
        {
            text: 'Delete', onPress: () => destroyList(title),
        },
        {
            text: 'Cancel', onPress: () => {console.log("Cancel Delete")},
        }
    ]);
}

  const index = noteArr.indexOf(title);
  if(index > -1){
      setListArr(noteArr.splice(index, 1));
      AsyncStorage.setItem('Notes', JSON.stringify(noteArr));
      navigation.setOptions({title: "Notes"});
      const value = AsyncStorage.getItem('Notes').then((value) => {
        if(value != undefined){
          setNoteArr(JSON.parse(value));
        }
      });
  }
}

  const displayNotes = () => {
    return noteArr.map(name => {
      return(
          <View key={name}>
              <Text >{name}</Text>
              <Button title='Delete' onPress={() => DeleteConfirmation(name)}/>
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
        <View>
            <Button title='+'/>
            <View>
              {displayNotes()}
            </View>
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
  