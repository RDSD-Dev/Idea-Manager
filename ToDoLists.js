import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStackNavigator} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function ToDoLists(props) {
    const navigation = useNavigation();
    const [listArr, setListArr] = useState([]);

    const loadData = navigation.addListener('focus', () => {
        console.log("Focus");
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
        //ToDoLists(props);
    });

    const navigateAddList = () => {
        //navigation.header = "";
        console.log("Navigate: Add List");
        navigation.navigate("Add List");
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
    }

    const destroyList = (name) => {
        
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
                </View>
            );
    })}

    if(listArr.length <= 0){
        console.log("Start");
        const value = AsyncStorage.getItem('Lists').then((value) => {
             if(!value){
                 console.log('Making New Lists Key');
                 const listArr = ['rootList1'];
                AsyncStorage.setItem('Lists', JSON.stringify(listArr));
            }
            else{
                if(value != undefined){
                console.log("GetLists: "+value);
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
  