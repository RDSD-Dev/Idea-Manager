import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function AddItem(props) {
    const table = props.route.params.table;
    const navigation = useNavigation();
    const [itemTitle, setItemTitle] = useState(undefined);
    const [itemDes, setItemDes] = useState(undefined);

    const navigateList = () => {
        navigation.goBack();
    }

    const addToDatabase = () => {
        const db = SQLite.openDatabase('ToDo.db');
        db.transaction((tx) => {
            const today = new Date();
            tx.executeSql('INSERT INTO ' + table + ' (name, description, makeDate) VALUES (?, ?, ?)', [itemTitle, itemDes, (today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate())],
            (txObj, resultSet) => {
                console.log("Add to database ", resultSet);
                navigateList();
            },
            (txObj, error) => console.log(error)
            );
        });
    }

    return (
        <ScrollView>
            <Text>Title: </Text>
            <TextInput value={itemTitle} onChangeText={setItemTitle} />
            <Text>Description: </Text>
            <TextInput value={itemDes} onChangeText={setItemDes} />
            <Button title='Add' onPress={addToDatabase}/>
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
  