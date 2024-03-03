import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditNotePhotos(props) {
    const table = props.route.params.table;
    const [note, setNote] = useState(undefined);
    const navigation = useNavigation();

    const isFocused = navigation.addListener('focus', () => {
        navigation.setOptions({title: table});
    });

    useEffect (() => {
        if(note == undefined){
        const value = AsyncStorage.getItem(table).then((value) => {
            if(!value){
                console.log('Making New Note Key');
                const listArr = [];
               AsyncStorage.setItem(table, "");
           }
           else{
               if(value != undefined){
               setNote(JSON.parse(value));
               }
            }
        });
    }
    else{
        updateNote();
    }
    }, [note]);

    const updateNote = () => {
        AsyncStorage.setItem(table, JSON.stringify(note));
    }

    return (
      <ScrollView style={{}}>
        <Button title="Add" onPress={() => updateNote()}/>
        <View >
            <TextInput style={{}} value={note} onChangeText={setNote}/>
        </View>
        <StatusBar />
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
  