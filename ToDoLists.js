import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStackNavigator} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const Stack = createStackNavigator();

export default function ToDoLists(props) {
    const navigation = useNavigation();
    const [listArr, setListArr] = useState([]);

    const loadData = navigation.addListener('focus', () => {
        const value = AsyncStorage.getItem('Lists').then((value) => {
            if(!value){
              console.log('Making New Lists Key');
              const listArr = ['rootList1'];
              AsyncStorage.setItem('Lists', JSON.stringify(listArr));
            }
            else{
              if(value != undefined){
                setListArr(JSON.parse(value));
              }
            }
          });
    });

    const navigateAddList = () => {
        //navigation.header = "";
        console.log("Navigate: Add List");
        navigation.navigate("Add List");
    }

    const navigateUpdateList = (title) => {
        //navigation.header = "";
        console.log("Navigate: Update List");
        navigation.navigate("Update List", {list: title});
    }

    const navigateList = (name) => {
        //navigation.header = "";
        console.log("Navigate: ",name);
        navigation.navigate("To Do List", {table: name});
    }

    const moveListUp = (name) => {
        console.log("Move Up: ", name)
        const current = listArr.indexOf(name);
        let tempArr = [];
        for(let i=0; i< listArr.length; i++){
            if(i+1 == current){
                tempArr.push(listArr[current]);
                tempArr.push(listArr[i]);
                i++;
            }
            else{
                tempArr.push(listArr[i]);
            }
        }
        setListArr(tempArr);
        AsyncStorage.setItem('Lists', JSON.stringify(listArr));
    }

    const moveListDown = (name) => {
        console.log("Move Down: ", name)
        const current = listArr.indexOf(name);
        let tempArr = [];
        for(let i=0; i< listArr.length; i++){
            if(i == current && i != listArr.length-1){
                tempArr.push(listArr[i+1]);
                tempArr.push(listArr[current]);
                i++;
            }
            else{
                tempArr.push(listArr[i]);
            }
        }
        setListArr(tempArr);
        AsyncStorage.setItem('Lists', JSON.stringify(listArr));
    }

    const destroyList = (title) => {
        console.log("Delete: ", title);
        const db = SQLite.openDatabase('ToDo.db');
        db.transaction(tx => {
            // Dates are Y-M-D
            tx.executeSql('DROP TABLE IF EXISTS '+title, []);
        });

        const index = listArr.indexOf(title);
        if(index > -1){
            setListArr(listArr.splice(index, 1));
            AsyncStorage.setItem('Lists', JSON.stringify(listArr));
            navigation.setOptions({title: "To Do Lists"});
            const value = AsyncStorage.getItem('Lists').then((value) => {
              if(value != undefined){
                setListArr(JSON.parse(value));
              }
            });
        }
    }

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

    const displayLists = () => {
        navigation.header
        return listArr.map(name => {
            return(
                <View key={name}>
                    <Text >{name}</Text>
                    <Button title='Go' onPress={() => navigateList(name)} />
                    <Button title='Up' onPress={() => moveListUp(name)}/>
                    <Button title='Down' onPress={() => moveListDown(name)}/>
                    <Button title='Update' onPress={() => navigateUpdateList(name)}/>
                    <Button title='Delete' onPress={() => DeleteConfirmation(name)}/>
                </View>
            );
    })}

    if(listArr.length <= 0){
        const value = AsyncStorage.getItem('Lists').then((value) => {
             if(!value){
                 console.log('Making New Lists Key');
                 const listArr = [];
                AsyncStorage.setItem('Lists', JSON.stringify(listArr));
            }
            else{
                if(value != undefined){
                setListArr(JSON.parse(value));
                }
             }
         });
    }
    else{
        return (
            <ScrollView>
                <Button title="+" onPress={() => navigateAddList()}/>
                {displayLists()}
            </ScrollView>
        );
    }
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#A9A9A9',
      alignItems: 'center',
      justifyContent: 'center',
    },

  });
  