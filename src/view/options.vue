<template>
	<div class="main_app">
		<h1>Select folders</h1>
		<p>Messages in selected folders will be marked as read after each new mail is received and also on each program launch.</p>
		<tree name="tree" :nodes="nodes" :config="config" @nodeChecked="nodeChanged" @nodeUnchecked="nodeChanged"></tree>
		<p>Changes are automatically saved on each modification</p><p>If you wish to mark existing messages in these folders as read now, you can do so by using the button below.</p>
		<button @click="scanAndMarkAsRead(selectedNodes)">✔ Mark existing messages as read in selected folders</button>
	</div>
</template>

<script>
	import treeview from "vue3-treeview";
	import {scanAndMarkAsRead} from "../js/tools.js"
	var md5 = require("md5");
	export default {
		name: "optionsView",
		components: {
			tree: treeview,
		},
		mounted() {
			this.config.checkMode=0;
			browser.accounts.list().then(this.listAccounts);
			let getting = browser.storage.sync.get("selectedKeys");
			getting.then(this.onSettingsLoaded, this.onError);
			
		},
		methods: {
			scanAndMarkAsRead,
			listAccounts: function (arrayOfMailAccount) {
				this.nodes = [];
				this.config.roots.length = 0;
				
				arrayOfMailAccount.forEach((account) => {
					let id=md5(account.id);
					this.nodes[id] = {
						name: account.id,
						text: account.name,
						children: [],
						state:{checked:false}
					};
					this.config.roots.push(id);
					this.parseFolderData(account.folders, this.nodes[id]);
				});
			},
			nodeChanged:function()
			{
				let that=this;
				this.selectedNodes = Object.keys(this.nodes).filter(function(key) {
					return that.nodes[key].state.checked == true;
				});
				browser.storage.sync.set({
					selectedKeys: this.selectedNodes
				});
				
			},
			parseFolderData: function (folderData, parentElement) {
				
				folderData.forEach((folder) => {
					let id=md5(folder.accountId + folder.path);
					parentElement.children.push(id);

					this.nodes[id] = {
						name: id,
						text: folder.name,
						children: [],
						state:{checked:false}
					};
					if (folder.subFolders.length > 0)
						this.parseFolderData(
							folder.subFolders,
							this.nodes[id]
						);
				});
			},
			onSettingsLoaded:function(result)
			{
				
				if (!("selectedKeys" in result)) return;
				if ("newValue" in result.selectedKeys)
					this.selectedNodes = result.selectedKeys.newValue;
				else
					this.selectedNodes = result.selectedKeys;
				
				let that=this;
				Object.values(this.selectedNodes).forEach(function(value) {
					return that.nodes[value].state.checked = true;
				});
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
						stroke: "black",
						strokeWidth: 3,
						viewBox: "0 0 24 24",
						draw: "M 2 12 L 22 12",
					},
					closedIcon: {
						type: "shape",
						stroke: "black",
						strokeWidth: 3,
						viewBox: "0 0 24 24",
						draw: `M 12 2 L 12 22 M 2 12 L 22 12`,
					},
				},
				nodes: {},
				selectedNodes:[]
			};
		},
	};
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
