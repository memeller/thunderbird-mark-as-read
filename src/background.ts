/*jshint esversion: 8 */
import {Md5} from 'ts-md5';
import { scanAndMarkAsRead, markAsReadFolderData,setDebug } from "./js/tools";
var selectedFolders: string[] = [];
var selectedDelayedFolders: string[] = [];
let isStartup=true;
let logConsole=false;
let delayEnabled=false;
var delayMS=5000;
let useFolderInfoEvent=false;
browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onStartup.addListener(onStartup);
browser.storage.onChanged.addListener(onChanged);

function onInstalled() {
    browser.runtime.openOptionsPage();
    onStartup();
}

async function onStartup() {
    browser.storage.sync.get(["selectedKeys","selectedDelayedKeys","useFolderInfoEvent","delayEnabled","logConsole","delayMS"]).then(onOptionsLoaded, onError);
}

function onChanged(result,area) {
    if(area!="sync")
    return;
    onOptionsLoaded(result);
    
}

function onOptionsLoaded(options) {
    if(options.logConsole!==undefined)
    {
        logConsole=getValueFromStorageObj(options,"logConsole",logConsole);
        setDebug(logConsole);
    }
    if(options.selectedKeys!==undefined)
        selectedFolders = getValueFromStorageObj(options,"selectedKeys",selectedFolders);
    if(options.delayMS!==undefined)
        delayMS = getValueFromStorageObj(options,"delayMS",delayMS);
    if(options.delayEnabled!==undefined)
        delayEnabled = getValueFromStorageObj(options,"delayEnabled",delayMS);
    if(options.selectedDelayedKeys!==undefined)
        selectedDelayedFolders = getValueFromStorageObj(options,"selectedDelayedKeys",selectedDelayedFolders);
    if(options.useFolderInfoEvent!==undefined)
    {
        let useFolderInfoEventNewValue  = getValueFromStorageObj(options,"useFolderInfoEvent",useFolderInfoEvent);            
        if(useFolderInfoEvent!=useFolderInfoEventNewValue)
        {
            useFolderInfoEvent=useFolderInfoEventNewValue;
            setEventHandlers();
        }
    }
    if(isStartup)
    {
        isStartup=false;
        setEventHandlers();   
        if(logConsole)
            console.debug("MarkAsRead: Scanning folders at startup");
        scanAndMarkAsRead(selectedFolders,selectedDelayedFolders);
    }
}
function setEventHandlers()
{
    if (useFolderInfoEvent) {
        if(logConsole)
            console.debug("MarkAsRead: Using folder info event for new mail tracking");
        browser.folders.onFolderInfoChanged.addListener(folderInfoChanged);
        browser.messages.onNewMailReceived.removeListener(messageReceivedListener);
        browser.messages.onMoved.removeListener(messageMovedListener);
    } else {
        if(logConsole)
            console.debug("MarkAsRead: Using new mail received event for new mail tracking");
        browser.messages.onNewMailReceived.addListener(messageReceivedListener);
        browser.folders.onFolderInfoChanged.removeListener(folderInfoChanged);
        browser.messages.onMoved.addListener(messageMovedListener);    
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

function folderInfoChanged(folder) {
    if(logConsole)
        console.debug(`MarkAsRead: Folder info change detected, checking if anything should be marked as read`);
    markAsReadFolderData(folder, selectedFolders,selectedDelayedFolders);
}
async function messageMovedListener(oldMessages, movedMessages) {
    let movedMessagesBase= movedMessages;
    if("messages" in movedMessages)
         movedMessagesBase=movedMessages.messages;
    if(logConsole)
        console.debug(`MarkAsRead: MessagemovedEvent`);
     movedMessagesBase.forEach(message => {
        if(logConsole)
            console.log(message);
        //folder is optional in messageHeader
        if(message.folder===undefined)
        {
           return;
        }
        else
        {
            let folder=message.folder;
            let tempId = Md5.hashStr(folder.accountId + folder.path);
            if(logConsole)
                console.debug(`MarkAsRead: New message detected, tempId: ${tempId}`);
            if (selectedFolders.includes(tempId)) {
                if(logConsole)
                    console.debug(`MarkAsRead: Message belongs to folder that is marked`);
                if(logConsole)
                    console.debug(`MarkAsRead: Marking message ${message.id} as read`);
                browser.messages.update(message.id, { read: true });
        
            }
            if(delayEnabled)
            {
                if(selectedDelayedFolders.includes(tempId))
                {
                    if(logConsole)
                        console.debug(`MarkAsRead: Message belongs to folder that is marked`);
                    if(logConsole)
                        console.debug(`MarkAsRead: Marking message ${message.id} as read`);
                    setTimeout(() => {   browser.messages.update(message.id, { read: true });},delayMS);    
                }
            }
        }
    });

}
async function messageReceivedListener(folder, messages) {
    if(logConsole)
    console.debug(`MarkAsRead: messageReceivedListener`);
    let tempId =  Md5.hashStr(folder.accountId + folder.path);
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