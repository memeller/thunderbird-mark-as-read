<script >
	import Tree from "vue3-treeview";
	import {scanAndMarkAsRead,setDelayEnabled,setDelayValue	} from "../js/tools";
	import {Md5} from 'ts-md5';
	export default {
		name: "optionsView",
		components: {
			tree: Tree,
		},
		mounted() {
			browser.accounts.list().then(this.listAccounts);
			let getting = browser.storage.sync.get(["selectedKeys","selectedDelayedKeys","delayEnabled","treeSelectionMode","useFolderInfoEvent","logConsole","delayMS"]);
			getting.then(this.onSettingsLoaded.bind(this), this.onError);
			
		},
		watch: {
			useOnFolderInfo(newValue){
				browser.storage.sync.set({
					useFolderInfoEvent: newValue
				});
			},
			logConsole(newValue){
				browser.storage.sync.set({
					logConsole: newValue
				});
			},
			delayEnabled(newValue){
				browser.storage.sync.set({
					delayEnabled: newValue
				});
				setDelayEnabled(newValue);
			},
			delayMS(newValue){
				browser.storage.sync.set({
					delayMS: newValue
				});
				setDelayValue(newValue);
			},
			treeSelectionMode(newValue){
				browser.storage.sync.set({
					treeSelectionMode: newValue
				});
				this.config.checkMode=newValue?0:1;
			}
		},
		methods: {
			scanAndMarkAsRead,
			listAccounts: function (arrayOfMailAccount) {
				this.nodes = [];
				this.delayednodes = [];
				this.config.roots.length = 0;
				
				arrayOfMailAccount.forEach((account) => {
					let id=Md5.hashStr(account.id);
					this.nodes[id] = {
						name: account.id,
						text: account.name,
						children: [],
						state:{checked:false}
					};
					this.delayednodes[id] = {
						name: account.id,
						text: account.name,
						children: [],
						state:{checked:false}
					};
					this.config.roots.push(id);
					this.parseFolderData(account.folders, this.nodes[id],this.delayednodes[id]);
				});
			},
			nodeChanged:function()
			{
				let that=this;
				this.selectedNodes = Object.keys(this.nodes).filter(function(key) {
					return that.nodes[key].state.checked == true;
				});
				this.selectedDelayedNodes = Object.keys(this.delayednodes).filter(function(key) {
					return that.delayednodes[key].state.checked == true;
				});
				browser.storage.sync.set({
					selectedKeys: this.selectedNodes,
					selectedDelayedKeys: this.selectedDelayedNodes
				});
				
			},
			parseFolderData: function (folderData, parentElement,parendDelayedElement=null) {
				
				folderData.forEach((folder) => {
					let id=Md5.hashStr(folder.accountId + folder.path);
					parentElement.children.push(id);
					if(parendDelayedElement)
						parendDelayedElement.children.push(id);
					this.nodes[id] = {
						name: id,
						text: folder.name,
						children: [],
						state:{checked:false}
					};
					this.delayednodes[id] = {
						name: id,
						text: folder.name,
						children: [],
						state:{checked:false}
					};
					if (folder.subFolders.length > 0)
						this.parseFolderData(
							folder.subFolders,
							this.nodes[id],
							this.delayednodes[id]
						);
				});
			},
			onSettingsLoaded:function(result)
			{
				
				
				if ("useFolderInfoEvent" in result)
					this.useOnFolderInfo = result.useFolderInfoEvent;
				if ("logConsole" in result)
					this.logConsole = result.logConsole;
				if ("delayEnabled" in result)
					this.delayEnabled = result.delayEnabled;
				if ("delayMS" in result)
					this.delayedTreeEnabled = result.delayMS;
				
				if ("treeSelectionMode" in result)
				{
					this.treeSelectionMode = result.treeSelectionMode;
					this.config.checkMode=this.treeSelectionMode?0:1;
				}
				if ("selectedKeys" in result)
				{
					this.selectedNodes = result.selectedKeys;
					if("selectedDelayedKeys" in result)
						this.selectedDelayedKeys= result.selectedDelayedKeys;
					let that=this;
					Object.values(this.selectedNodes).forEach(function(value) {
						return that.nodes[value].state.checked = true;
					});
					Object.values(this.selectedDelayedNodes).forEach(function(value) {
						return that.nodes[value].state.checked = true;
					});
				}
			},
			onError:function(error)
			{
				console.log(`Error: ${error}`);
			}
		},
		data() {
			return {
				config: {
					checkboxes: true,
					roots: ["id1", "id2"],
					openedIcon: {
						type: "shape",
						strokeWidth: 3,
						viewBox: "0 0 24 24",
						draw: "M 2 12 L 22 12",
					},
					closedIcon: {
						type: "shape",
						strokeWidth: 3,
						viewBox: "0 0 24 24",
						draw: `M 12 2 L 12 22 M 2 12 L 22 12`,
					},
					checkMode:0
				},
				nodes: {},
				delayednodes:{},
				selectedNodes:[],
				selectedDelayedNodes:[],
				useOnFolderInfo:false,
				logConsole:false,
				delayMS:5000,
				delayEnabled:false,
				treeSelectionMode:1
			};
		},
	}
</script>

<style>
.main_app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	height: 100vh;
	/* color: #2c3e50; */
	background-color: var(--in-content-box-background);
	/* margin-top: 60px; */
}

</style>
<template>
	<div class="main_app">
		<h1>Select folders</h1>
		<p>Messages in selected folders will be marked as read after each new mail is received and also on each program launch.</p>
		<tree name="tree" :nodes="nodes" :config="config" @nodeChecked="nodeChanged" @nodeUnchecked="nodeChanged"></tree>
		<label for="checkbox_delayedtree"><input type="checkbox" id="checkbox_delayedtree" v-model="delayEnabled"/>
		Mark messages as read in selected folders with a delay (separate list of folders).</label>
		<div v-if="delayEnabled" style="margin-left:2rem">
			<p >Delay: <input v-model="delayMS" type="number" min="1000" step="1000"/> ms</p>
			<tree style="margin-top:0px;" name="delayedtree" :nodes="delayednodes" :config="config" @nodeChecked="nodeChanged" @nodeUnchecked="nodeChanged"></tree>
		</div>
		<label for="checkbox_tree"><input type="checkbox" class="checkbox-custom" id="checkbox_tree" v-model="treeSelectionMode"/>
		Auto select/deselect subfolder nodes when parent folder is selected.</label>
		<p>Changes are automatically saved on each modification</p>
		
		<p>If you wish to mark existing messages in these folders as read now, you can do so by using the button below.</p>
		<button @click="scanAndMarkAsRead(selectedNodes)">✔ Mark existing messages as read in selected folders</button>
		<p>For some reason Thunderbird will sometimes fail to fire the proper event when receiving new mail. If new messages are received in selected folders, and their read status is not changed, turn the option below on. If this option is turned on, after new message is received and put into one of the selected folders, all of the old unread messages (if any) will be marked as read in this folder.</p>
		<label for="checkbox"><input type="checkbox" class="checkbox-custom" id="useOnFolderInfo" v-model="useOnFolderInfo" />
		Use different event to detect new messages</label>
		<label for="checkbox"><input type="checkbox" class="checkbox-custom" id="logConsole" v-model="logConsole" />Log various debug data to console</label>
	</div>
</template>