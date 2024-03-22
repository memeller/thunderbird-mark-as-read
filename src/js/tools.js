/*jshint esversion: 8 */
var md5 = require("md5");
var logConsole=false;
export async function scanAndMarkAsRead(selectedFolders) {
    if(logConsole)
        console.debug(`MarkAsRead: scanAndMarkAsRead`)
    browser.accounts.list().then((result) => {
        result.forEach((account) => {
            markAsReadFolderData(account.folders, selectedFolders);
        });
    });
}

export function markAsReadFolderData(folderData, markAsReadIds) {
    if(logConsole)
        console.debug(`MarkAsRead: mark as read folder data`)
    if (Array.isArray(folderData)) {
        folderData.forEach((folder) => {
            checkFolderAndMark(folder, markAsReadIds);
            if (folder.subFolders.length > 0)
                markAsReadFolderData(folder.subFolders, markAsReadIds);
        });
    } else
        checkFolderAndMark(folderData, markAsReadIds);
}
export function setDebug(isDebug)
{
    console.debug("tools setDebug: "+isDebug);
    logConsole=isDebug;
}
function checkFolderAndMark(folder, markAsReadIds) {
    let id = md5(folder.accountId + folder.path);
    if(logConsole)
        console.debug(`MarkAsRead: check folders and mark as read: ${folder.accountId} ${folder.path}`)
    if (markAsReadIds.includes(id))
    {
        if(logConsole)
            console.debug(`MarkAsRead: Found id that should be marked: ${id}`)
        browser.messages
        .query({ unread: true, folder: folder })
        .then((messageList) => {
            if (messageList.messages.length > 0)
                messageList.messages.forEach((message) => {
                    browser.messages.update(message.id, { read: true });
                });
        });
    }
}