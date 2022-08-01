/*jshint esversion: 8 */
var md5 = require("md5");
export async function scanAndMarkAsRead(selectedFolders) {
    browser.accounts.list().then((result) => {
        result.forEach((account) => {
            markAsReadFolderData(account.folders, selectedFolders);
        });
    });
}

function markAsReadFolderData(folderData, markAsReadIds) {
    folderData.forEach((folder) => {
        let id = md5(folder.accountId + folder.path);
        if (markAsReadIds.includes(id))
            browser.messages
            .query({ unread: true, folder: folder })
            .then((messageList) => {
                if (messageList.messages.length > 0)
                    messageList.messages.forEach((message) => {
                        browser.messages.update(message.id, { read: true });
                    });
            });
        if (folder.subFolders.length > 0)
            markAsReadFolderData(folder.subFolders, markAsReadIds);
    });
}