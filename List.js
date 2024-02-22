import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function List(props) {
    const db = SQLite.openDatabase('ToDo.db');
    const table = props.route.params.table;
    const [items, setItems] = useState([]);
    const [isUpdatingData, setIsUpdatingData] = useState(false);
    const navigation = useNavigation();

    navigation.setOptions({title: table});

    useEffect (() => {
        db.transaction(tx => {
            // Dates are Y-M-D
            tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+' (id INTEGER PRIMARY KEY AUTOINCREMENT, name VarChar(32), description Text, makeDate Date, completeDate Date, remakeNum int)', []);
        });

        db.transaction(tx => {
            tx.executeSql('SELECT * FROM ' + table,  [],
                (txObj, resultSet) => setItems(resultSet.rows._array),
                (txObj, error) => console.log(error)
            );
        });

    }, []);

    const loadData = () => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM ' + table,  [],
                (txObj, resultSet) => setItems(resultSet.rows._array),
                (txObj, error) => console.log(error)
            );
        });
        console.log("Load ", items);
    }

    const isFocused = navigation.addListener('focus', () => {
        console.log(isUpdatingData);
        if(isUpdatingData){
            loadData();
            setIsUpdatingData(false);
        }
    });

    const navigateAddItem = () => {
        console.log("Navigate Add Item")
        props.navigation.navigate('Add Item', {refresh: true, table: table});
        setIsUpdatingData(true);
    }

    const navigateUpdateItem = (id) => {
        console.log("Navigate Update Item")
        props.navigation.navigate('Update Item', {refresh: true, table: table, id: id});
        setIsUpdatingData(true);
    }

    const deleteItem = (id) => {
        const sql ="DELETE FROM "+table+" WHERE id='" + id + "'";
        console.log(sql);
        db.transaction(tx => {tx.executeSql('DELETE FROM '+table+' WHERE id=?', [id],
        (txObj, resultSet) => {
            if(resultSet.rowsAffected > 0){
                let existingNames = [...items].filter(name => name.id !== id);
                setItems(existingNames);
                console.log("Deleted: ", id);
            }
        },
        (txObj, error) => console.log(error)
        );
        });
        
    }

    const displayItems = () => {
        console.log("names: ",items);
        return items.map((name, index, description) => {
            return (
                <View key={index} >
                    <Text>{name.name}</Text>
                    <Text>{name.description}</Text>
                    <Button title='Delete' onPress={() => deleteItem(name.id)} />
                    <Button title='Update' onPress={() => navigateUpdateItem(name.id)} />
                </View>
            );
        });
    };

    return (
      <ScrollView style={{}}>
        <Button title="Add" onPress={navigateAddItem}/>
        <View >
            {displayItems()}
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
  