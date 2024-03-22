/*jshint esversion: 8 */
var md5 = require("md5");
import { scanAndMarkAsRead, markAsReadFolderData,setDebug } from "../js/tools.js";
var selectedFolders = [];
let isStartup=true;
let logConsole=false;
let useFolderInfoEvent=false;
browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onStartup.addListener(onStartup);
browser.storage.onChanged.addListener(onOptionsLoaded);

function onInstalled(details) {
    browser.runtime.openOptionsPage();
    onStartup();
}

async function onStartup() {
    browser.storage.sync.get(["selectedKeys","useFolderInfoEvent","logConsole"]).then(onOptionsLoaded, onError);
}

function onChanged(result,area) {
    if(area!="sync")
    return;
    onOptionsLoaded(result,true);
    
}

function onOptionsLoaded(options,onChanged=false) {
    if(options.logConsole!==undefined)
    {
        logConsole=getValueFromStorageObj(options,"logConsole",logConsole);
        setDebug(logConsole);
    }
    if(options.selectedKeys!==undefined)
        selectedFolders = getValueFromStorageObj(options,"selectedKeys",selectedFolders);
    if(options.useFolderInfoEvent!==undefined)
    {
        useFolderInfoEvent  = getValueFromStorageObj(options,"useFolderInfoEvent",useFolderInfoEvent);    
        if (useFolderInfoEvent) {
            if(logConsole)
                console.debug("MarkAsRead: Using folder info event for new mail tracking");
            browser.folders.onFolderInfoChanged.addListener(folderInfoChanged);
            browser.messages.onNewMailReceived.removeListener(messageReceivedListener);
        } else {
            if(logConsole)
                console.debug("MarkAsRead: Using new mail received event for new mail tracking");
            browser.messages.onNewMailReceived.addListener(messageReceivedListener);
            browser.folders.onFolderInfoChanged.removeListener(folderInfoChanged);
        }   
    }
    if(isStartup)
    {
        isStartup=false;
        if(logConsole)
            console.debug("MarkAsRead: Scanning folders at startup");
        scanAndMarkAsRead(selectedFolders);
    }
}
function getValueFromStorageObj(storageObj,key,defaultValue)
{
    if(storageObj[key]===undefined)
    {
        return defaultValue;
    }
    if(storageObj[key]===Object(storageObj[key]) && "newValue" in storageObj[key])
    {
        return storageObj[key].newValue;
    }
    else
    {
        return storageObj[key];
    }
}
function onError(error) {
    console.log(`Error: ${error}`);
}

function folderInfoChanged(folder, folderInfo) {
    if(logConsole)
        console.debug(`MarkAsRead: Folder info change detected, checking if anything should be marked as read`);
    markAsReadFolderData(folder, selectedFolders);
}
async function messageReceivedListener(folder, messages) {
    let tempId = md5(folder.accountId + folder.path);
    if(logConsole)
        console.debug(`MarkAsRead: New message detected, tempId: ${tempId}`);
    if (selectedFolders.includes(tempId)) {
        if(logConsole)
            console.debug(`MarkAsRead: Message belongs to folder that is marked`);
        let messagebase = messages;
        if ("messages" in messages)
            messagebase = messages.messages;
        for (let message of messagebase) {
            if(logConsole)
                console.debug(`MarkAsRead: Marking message ${message.id} as read`);
            browser.messages.update(message.id, { read: true });
        }
    }
}