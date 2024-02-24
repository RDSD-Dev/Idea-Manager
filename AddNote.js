import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddNote(props) {
    const navigation = useNavigation();
    const [noteTitle, setNoteTitle] = useState(undefined);

    const navigateNotes = () => {
        navigation.goBack();
    }

    const addNote = () => {
        console.log('Add Note');
        AsyncStorage.getItem('Notes').then((value) => {
            let notes = JSON.parse(value);
            notes.push(noteTitle);
            AsyncStorage.setItem('Notes', JSON.stringify(notes));
        });
        navigateNotes();
    }

    return (
        <ScrollView>
            <Text>Title: </Text>
            <TextInput value={noteTitle} onChangeText={setNoteTitle}/>
            <Button title='+' onPress={() => addNote()}/>
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
  