import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

export default function UpdateList(props) {
    const db = SQLite.openDatabase('ToDo.db');
    const originalTitle = props.route.params.list;
    const [listName, setListName] = useState(originalTitle);
    const navigation = useNavigation();

    const navigateToDoLists = () => {
        console.log('Navigate: To Do Lists');
        navigation.goBack();
    }

    const updateList = () => {
        const value = AsyncStorage.getItem('Lists').then((value) => {
            let listArr = JSON.parse(value);
            const index = listArr.indexOf(originalTitle);
            listArr[index] = listName;
            db.transaction(tx => {
                // Dates are Y-M-D
                tx.executeSql('ALTER TABLE '+originalTitle+' RENAME TO '+ listName, []);
            });
            AsyncStorage.setItem('Lists', JSON.stringify(listArr)).then(navigateToDoLists());
        });
    }
    
  return (
    <View>
        <Text>Title: </Text>
        <TextInput value={listName} onChangeText={setListName}/>
        <Button title='Update' onPress={() => updateList()}/>
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
  