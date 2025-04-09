/*jshint esversion: 8 */
var md5 = require("md5");
var logConsole=false;
const info = await browser.runtime.getBrowserInfo();
    
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
        console.debug(`MarkAsRead: + markAsReadFolderData`)
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
    logConsole=isDebug;
    if(logConsole)
        console.debug("MarkAsRead: tools setDebug: "+isDebug);
}
async function checkFolderAndMark(folder, markAsReadIds) {
    let id = md5(folder.accountId + folder.path);
    if(logConsole)
        console.debug(`MarkAsRead: | check folders and mark as read: ${folder.accountId} ${folder.path}`)
    if (markAsReadIds.includes(id))
    {
        if(logConsole)
            console.debug(`MarkAsRead: |__ Found id that should be marked: ${id}`)
        if(parseInt(info.version) >=111 && typeof("browser.folders.markAsRead")==="function")
        {
            browser.folders.markAsRead(folder.id);
            if(logConsole)
                console.debug(`MarkAsRead:    + Using new method`)
        }
        else
        {
            if(logConsole)
                console.debug(`MarkAsRead:    + Using old method`)
            
            let messages = getMessages(browser.messages.query({ unread: true, folderId: folder.id }));
            for await (let message of messages) {
                browser.messages.update(message.id, { read: true });
            }
        }
    }
}
async function* getMessages(list) {
    let page = await list;
    for (let message of page.messages) {
      yield message;
    }
  
    while (page.id) {
      page = await browser.messages.continueList(page.id);
      for (let message of page.messages) {
        yield message;
      }
    }
  }