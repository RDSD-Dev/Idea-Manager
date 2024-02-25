import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

export default function UpdateNote(props) {
  const navigation = useNavigation();
  const [note, setNote] = useState(undefined);
  const [noteTitle, setNoteTitle] = useState(undefined);
  const table = props.route.params.table;

  const isFocused = navigation.addListener('focus', () => {
    navigation.setOptions({title: "Update "+ table});
    if(note == undefined){
        setNoteTitle(table);
        AsyncStorage.getItem(table).then((value) => {
            setNote(value);
        });
      }
    });

    const navigateNotes = () => {
    console.log("Navigate:");
    navigation.navigate("Notes");
    }

    const updateNoteTitle = () => {
        console.log("Update");
        const value = AsyncStorage.getItem('Notes').then((value) => {
            let tempArr = JSON.parse(value);
            const index = tempArr.indexOf(table);
            tempArr[index] = noteTitle;
            AsyncStorage.setItem('Notes', JSON.stringify(tempArr)).then((value) => {
                AsyncStorage.setItem(noteTitle, note).then((value) => {
                    AsyncStorage.removeItem(table).then((value) => {
                        navigateNotes();
                    })
                });
            });
        });
    }

    return(
        <View>
            <Text>Title: </Text>
            <TextInput value={noteTitle} onChangeText={setNoteTitle}/>
            <Button title='Update' onPress={() => updateNoteTitle()}/>
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
  