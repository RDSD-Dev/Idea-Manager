import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function AddItem(props) {
    const db = SQLite.openDatabase('ToDo.db');
    const table = props.route.params.table;
    const itemId = props.route.params.id;
    const navigation = useNavigation();
    const [itemTitle, setItemTitle] = useState(undefined);
    const [itemDes, setItemDes] = useState(undefined);

    const navigateList = () => {
        navigation.goBack();
    }

    const getItem = () => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM ' + table + ' WHERE id = ?', [itemId],
            (txObj, resultSet) => {
                console.log("Got the item ", resultSet);
                setItemTitle(resultSet.rows._array.name);
                setItemDes(resultSet.rows._array.description);
            },
            (txObj, error) => console.log(error)
            );
        });
    }

    const updateDatabase = () => {
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

    getItem();

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
  