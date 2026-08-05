/*jshint esversion: 8 */
import {Md5} from 'ts-md5';
var logConsole=false;
var delayMS=5000;
var delayEnabled=false;    
export async function scanAndMarkAsRead(selectedFolders,selectedDelayedFolders) {
    if(logConsole)
        console.debug(`MarkAsRead: scanAndMarkAsRead`)
    browser.accounts.list().then((result) => {
        for (let account of result) {
            markAsReadFolderData(account.folders, selectedFolders,selectedDelayedFolders);
        }
    });
}

export function markAsReadFolderData(folderData, markAsReadIds,markAsReadDelayedIds) {
    if(logConsole)
        console.debug(`MarkAsRead: + markAsReadFolderData`)
    if (Array.isArray(folderData)) {
        folderData.forEach((folder) => {
            checkFolderAndMark(folder, markAsReadIds);
            if(delayEnabled)
                checkFolderAndMark(folder, markAsReadDelayedIds,true);
            if (folder.subFolders.length > 0)
                markAsReadFolderData(folder.subFolders, markAsReadIds,markAsReadDelayedIds);
        });
    } else
        checkFolderAndMark(folderData, markAsReadIds,markAsReadDelayedIds);
}
export function setDelayEnabled(isDelayEnabled)
{
    delayEnabled=isDelayEnabled;
    if(logConsole)
        console.debug("MarkAsRead: tools setDelayEnabled: "+isDelayEnabled);
}
export function setDebug(isDebug)
{
    logConsole=isDebug;
    if(logConsole)
        console.debug("MarkAsRead: tools setDebug: "+isDebug);
}
export function setDelayValue(miliseconds)
{
    delayMS=miliseconds;
    if(logConsole)
        console.debug("MarkAsRead: tools setDelayValue: "+miliseconds);
}
async function checkFolderAndMark(folder, markAsReadIds,isDelayed=false) {
    let id =  Md5.hashStr(folder.accountId + folder.path);
    let info = await browser.runtime.getBrowserInfo();
    if(logConsole)
        console.debug(`MarkAsRead: | check folders and mark as read: ${folder.accountId} ${folder.path}`)
    if (markAsReadIds.includes(id))
    {
        if(logConsole)
            console.debug(`MarkAsRead: |__ Found id that should be marked: ${id}, isDelayed=${isDelayed}`);
        if(parseInt(info.version) >=111 && typeof(browser.folders.markAsRead)==="function")
        {
            if(isDelayed)
            {
                setTimeout(() => {browser.folders.markAsRead(folder.id)},delayMS);    
            }
            else
            {
                browser.folders.markAsRead(folder.id);
            }
            if(logConsole)
                console.debug(`MarkAsRead:    + Using new method`)
        }
        else
        {
            if(logConsole)
                console.debug(`MarkAsRead:    + Using old method`)
            
            let messages = getMessages(browser.messages.query({ unread: true, folderId: folder.id }));
            for await (let message of messages) {
                if(isDelayed)
                {
                    setTimeout(() => {   browser.messages.update(message.id, { read: true });},delayMS);    
                }
                else
                {
                    browser.messages.update(message.id, { read: true });
                }
             
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