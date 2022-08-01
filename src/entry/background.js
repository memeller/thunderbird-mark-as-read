/*jshint esversion: 8 */
var md5 = require("md5");
import { scanAndMarkAsRead } from "../js/tools.js";
var selectedFolders = [];
browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onStartup.addListener(onStartup);
browser.messages.onNewMailReceived.addListener(messageReceivedListener);
browser.storage.onChanged.addListener(onSettingsLoaded);

function onInstalled(details) {
    browser.runtime.openOptionsPage();
}

function onStartup() {
    browser.storage.sync.get("selectedKeys").then(onSettingsLoaded, onError);
    scanAndMarkAsRead(selectedFolders);
}

function onSettingsLoaded(result) {
    if (!("selectedKeys" in result)) return;
    if ("newValue" in result.selectedKeys)
        selectedFolders = result.selectedKeys.newValue;
    else
        selectedFolders = result.selectedKeys;

}

function onError(error) {
    console.log(`Error: ${error}`);
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