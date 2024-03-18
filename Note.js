import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function Note(props) {
  const [images, setImages] = useState([]);
    const table = props.route.params.table;
    const [note, setNote] = useState(undefined);
    const navigation = useNavigation();

    const isFocused = navigation.addListener('focus', () => {
        navigation.setOptions({title: table});
    });

    if(images.length <= 0){
      const value = AsyncStorage.getItem(table + "Pics").then((value) => {
           if(!value){
               console.log('Making New Lists Key');
               const images = [];
              AsyncStorage.setItem(table + "Pics", JSON.stringify(images));
          }
          else{
              if(value != undefined){
              setImages(JSON.parse(value));
              }
           }
       });
  }

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

    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        
        quality: 1,
      });
  
      if (!result.canceled) {
        let tempArr = images;
        tempArr.push(result.assets[0].uri);
        setImages(tempArr);
        AsyncStorage.setItem(table + "Pics", JSON.stringify(images));

      }
    };

    const updateNote = () => {
        AsyncStorage.setItem(table, JSON.stringify(note));
    }

    const displayPics = () => {
      return images.map(name => {
        return(
          <View>
            <Image key={name} source={{ uri: name}} style={{ width: 200, height: 200 }} />
          </View>
        );
      })
    }

    return (
      <ScrollView style={{}}>
        <Button title="Pick an image from camera roll" onPress={pickImage} />
        {displayPics()}
        <StatusBar />
        <TextInput style={[styles.TextInput]} value={note} multiline={true} onChangeText={setNote}/>
        
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

    TextInput: {
      backgroundColor: '#808080',
      color: '#000000',
     
      
    }


  });
  