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
    constructor(name, order, parentKey, color){ // Name: string, Order: int, parentKey: string[], color: string
        this.name = name;
        this.order = order;
        this.parentKey = parentKey;
        this.color = color;
        this.children = [];

        this.key = "";
        for(let i=0; i<parentKey.length; i++){
            this.key += parentKey[i] + "/";
        }
        this.key += this.name;
        return;
    }
    setAll(name, order, parentKey, color, key, children){
        this.name = name;
        this.order = order;
        this.parentKey = parentKey;
        this.color = color;
        this.key = key;
        this.children = children;
    }

    pushChild(newChild){
        this.children.push(newChild);
        this.saveAsync();
    }
    deleteChild(name, order){
        console.log("Deleting : #", order, " ", name);
        const index = this.children.findIndex((e) => e.name == name && e.order == order );
        this.children.splice(index, 1);
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
    setParentKey(parentKey){
        this.parentKey = parentKey;
    }

    saveAsync(){
        AsyncStorage.setItem(this.key, JSON.stringify(this));
    }
}
