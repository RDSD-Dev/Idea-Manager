import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditList() {
    const [listArr, setListArr] = useState([]);
    const [isAddingList, setIsAddingList] = useState(false);
    const [listName, setListName] = useState(undefined);

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
  
    for(let i = 0; i < listArr.length; i ++){
      console.log("for: " + i);
      let jsx = drawerScreens;
      jsx += <Drawer.Screen initialParams={{table: listArr[i], test: listArr[i]}} name={listArr[i]} component = {List}/>;
      setDrawerScreens(jsx);
    }
    let i = 0;
  }
  else{
    //return ();
  }
    
  return (
    <View>
      <Button title='Add' onPress={displayAddList}></Button>
      <View style={this.addListStyle(true)}>
        <TextInput value={listName} onChangeText={setListName}></TextInput>
        <Button title='Add List' onPress={addList}/>
      </View>
      
      <ScrollView style={this.addListStyle(false)}>
        {displayLists()}
      </ScrollView>
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
  