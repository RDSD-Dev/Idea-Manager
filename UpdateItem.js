import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function AddItem(props) {
    const db = props.route.params.data;
    const table = props.route.params.table;
    const itemId = props.route.params.id;
    const navigation = useNavigation();
    const [itemTitle, setItemTitle] = useState(undefined);
    const [itemDes, setItemDes] = useState(undefined);

    const navigateList = () => {
        navigation.goBack();
    }

    const getItem = () => {
        console.log("Get");
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM ' + table + ' WHERE id = ?', [itemId],
            (txObj, resultSet) => {
                console.log("Got the item ", resultSet.rows._array[0].name);
                setItemTitle(resultSet.rows._array[0].name);
                setItemDes(resultSet.rows._array[0].description);
            },
            (txObj, error) => console.log(error)
            );
        });
    }

    const updateDatabase = () => {
        console.log("Update");

        db.transaction(tx => {
            tx.executeSql('UPDATE '+table+' SET name = ?, description = ? WHERE id = ?', [itemTitle, itemDes, itemId],
            (txObj, resultSet) => {
                if(resultSet.rowsAffected > 0){
                    console.log("Updated to database ", resultSet);
                    navigateList();
                }
            },
                (txObj, error) => console.log(error)
            );
        });
    }

    if(itemTitle == undefined){
        getItem();
    }

    return (
        <ScrollView>
            <Text>Title: </Text>
            <TextInput value={itemTitle} onChangeText={setItemTitle} />
            <Text>Description: </Text>
            <TextInput value={itemDes} onChangeText={setItemDes} />
            <Button title='Update' onPress={() => updateDatabase()}/>
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
  