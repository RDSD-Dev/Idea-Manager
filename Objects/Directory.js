import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export class Directory {
    // Directories should store their children their grand children and the names of their grandchildren
    // Names are what the directory is called locally
    // Async Key is the parent names, separated by a /, followed by the name
    // Parent consists of an array of the names of their parents example: ['/', 'Test'] would mean that you are inside the Test directory which is located in the / directory
    // Child consists of an array of the names of their children example: [{name: 'Note', order: 0, parent:['/', 'this.name'], child: [], type: 'Note', text: "Note stuff"}]
    constructor(name, order, parent, color){ // Name: string, Order: int, Parent: string[], color: string
        this.name = name;
        this.order = order;
        this.parent = parent;
        this.color = color;

        this.isOpen = true;
        this.saveAsync();
    }

    setName(name){
        this.name = name;
        this.saveAsync();
    }
    setOrder(order){
        this.order = order;
        this.saveAsync();
    }
    setColor(color){
        this.color = color;
        this.saveAsync();
    }
    setParent(parent){
        this.parent = parent;
    }


    addChild(name, order, type){

    }

    loadChildren(){

    }

    saveAsync(){
        console.log('Saving: ', this.name);
        let key = '';
        for(let i=0;i<this.parent.length; i++){
            key += this.parent[i]+'/';
        }
        key += this.name;
        AsyncStorage.setItem(key, JSON.stringify(this));
    }

    toggle(){ // Opens or closes depending on current state

    }

    open(){

    }

    close(){

    }
    
    displayMain(){
        var header;
        var body = <Text>This seems to work.</Text>;
        if(this.parent.length == 0){ // Is root
            header = (
                <View style={styles.header}>
                    <Text style={ styles.headerLeft}>Settings</Text>
                    <Text style={styles.headerMiddle}>Idea Manager</Text>
                    <Text style={styles.headerRight}>Add</Text>
                </View>
            );
        }
        return(
            <View>
                {header}
                <ScrollView>{body}</ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#fff',
      alignItems: 'center',
      paddingTop: 40,
    },
    headerLeft: {
        position: 'relative',
        left: 0,
        alignItems: 'flex-start',
        justifySelf: 'flex-start', 
        paddingRight: 10,
    },
    headerMiddle: {
        flexDirection: 'column'
    },
    headerRight: {
        justifySelf: 'right',
        alignItems: 'right',
        right: 0,
        paddingLeft: 10,
    },
    
  });