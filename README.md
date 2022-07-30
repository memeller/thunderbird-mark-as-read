# Thunderbird - Auto Mark As Read

Automatically mark incoming messages as read if they are in one of selected folders. 

An attempt to revive & enhance ['Mark Junk Read' by Alex Cabal](https://addons.thunderbird.net/en-us/thunderbird/addon/mark-junk-read/), which does not work for TB v68+.

After installing simply select folders using extension's options. After receiving new mail the extension checks if any of the new messages belong to any of the selected folders and marks them as read if they do. Also on each program launch the extension checks selected folders for any unread messages and marks them as read.

Uses [sanyu1225/vue-cli-plugin-chrome-extension-cli](https://github.com/sanyu1225/vue-cli-plugin-chrome-extension-cli) as base.

The extension uses [browser.messages.update](https://webextension-api.thunderbird.net/en/91/messages.html#update-messageid-newproperties) to change the 'read' parameter of messages, so should be safe for your inbox.
## Permissions
- accountsRead - used for scanning the folders of each account
- messagesRead - used for marking messages as read and querying unread messages in selected folders. Also needed for scanning of incoming mail.
- storage - used for saving and (in future) syncing of the folders selected in option panel