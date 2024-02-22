import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function AddList() {
    const [listName, setListName] = useState(undefined);
    const navigation = useNavigation();

    const navigateToDoLists = () => {
        console.log('Navigate: To Do Lists');
        navigation.goBack();
    }

    const addList = () => {

        const value = AsyncStorage.getItem('Lists').then((value) => {

            let listArr = JSON.parse(value);
            listArr.push(listName);
            console.log(listArr);

            AsyncStorage.setItem('Lists', JSON.stringify(listArr)).then(navigateToDoLists());
        });
    }


  

    
  return (
    <View>
        <Text>Title: </Text>
        <TextInput value={listName} onChangeText={setListName}/>
        <Button title='Add' onPress={() => addList()}/>

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
  