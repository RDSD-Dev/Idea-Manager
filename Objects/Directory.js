import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';

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
        this.children = [];
        this.childrenNum = 0;

        this.isOpen = true;
        this.isAdding = false;
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
    setIsAdding(bool){
        this.isAdding = bool;
    }

    addChild(name){
        this.children.push(name);
        this.childrenNum++;
        
    }

    loadChildren(){

    }

    saveAsync(){
        //console.log('Saving: ', this.name);
        let key = '';
        for(let i=0;i<this.parent.length; i++){
            key += this.parent[i]+'/';
        }
        key += this.name;
        AsyncStorage.setItem(key, JSON.stringify(this));
    }
}
