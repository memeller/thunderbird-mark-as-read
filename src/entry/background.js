/*jshint esversion: 8 */
var md5 = require("md5");
import { scanAndMarkAsRead, markAsReadFolderData } from "../js/tools.js";
var selectedFolders = [];
browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onStartup.addListener(onStartup);
browser.storage.onChanged.addListener(onKeysLoaded);

function onInstalled(details) {
    browser.runtime.openOptionsPage();
    onStartup();
}

function onStartup() {
    browser.storage.sync.get("selectedKeys").then(onKeysLoaded, onError);
    scanAndMarkAsRead(selectedFolders);
}

function onKeysLoaded(result) {
    if (!("selectedKeys" in result)) return;
    if ("newValue" in result.selectedKeys)
        selectedFolders = result.selectedKeys.newValue;
    else
        selectedFolders = result.selectedKeys;
    browser.storage.sync.get("useFolderInfoEvent").then(onUseFolderInfoLoaded, onError);
}

function onUseFolderInfoLoaded(result) {
    if (!("useFolderInfoEvent" in result)) return;
    let useFolderInfoEvent = false;
    if (typeof result.useFolderInfoEvent == "boolean")
        useFolderInfoEvent = result.useFolderInfoEvent;
    else
        useFolderInfoEvent = result.useFolderInfoEvent.newValue;
    if (useFolderInfoEvent) {
        browser.folders.onFolderInfoChanged.addListener(folderInfoChanged);
        browser.messages.onNewMailReceived.removeListener(messageReceivedListener);
    } else {
        browser.messages.onNewMailReceived.addListener(messageReceivedListener);
        browser.folders.onFolderInfoChanged.removeListener(folderInfoChanged);
    }

}

function onError(error) {
    console.log(`Error: ${error}`);
}

function folderInfoChanged(folder, folderInfo) {

    markAsReadFolderData(folder, selectedFolders);
}
async function messageReceivedListener(folder, messages) {
    let tempId = md5(folder.accountId + folder.path);
    if (selectedFolders.includes(tempId)) {
        let messagebase = messages;
        if ("messages" in messages)
            messagebase = messages.messages;
        for (let message of messagebase) {
            browser.messages.update(message.id, { read: true });
        }
    }
}