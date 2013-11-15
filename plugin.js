/**
 * SCAYT
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
(function() {
	var dom = tinymce.DOM;
	var util = tinymce.util;
	var undoManager = tinymce.UndoManager;
	
	tinymce.PluginManager.requireLangPack('scayt');	
	tinymce.PluginManager.add('scayt', function(editor, url) {
		"use strict";

		// Default items on context menu
		editor.settings.contextmenu = editor.settings.contextmenu || 'scayt link image inserttable | cell row column deletetable';

		var options = {
			definitionDefaultOption: {
				scayt_custom_url: {
					type: "string",
					"default": "//svc.webspellchecker.net/spellcheck31/lf/scayt3/tinymce/tinymcescayt.js"
				},

				scayt_auto_startup: {
					type: "boolean",
					"default": false
				},
				
				scayt_customer_id: {
					type: "string",
					"default": '1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2'
				},

				scayt_max_suggestion: {
					type: "number",
					"default": 5
				},

				scayt_context_moresuggestions: {
					type: "string",
					"default": "on",
					allowable: {
						on: true,
						off: true
					}	
				},
				scayt_context_commands: {
					type: "string",
					"default": "ignore,ignoreall,add"
				},
				scayt_context_menu_items_order: {
					type: "string",
					"default": "suggest|moresuggest|control"
				},
				scayt_ui_tabs: {
					type: "string",
					"default": "1,1,1"
				},
				scayt_slang: {
					type: "string",
					"default": "en_US"
				}
			},
			parseOptions: function(editor) {
				var self = this,
					optionDefinition = self.definitionDefaultOption,
					settings = editor.settings,
					getParameter = utils.getParameter,
					isAllowable = utils.isAllowable;

				settings.scayt_auto_startup = getParameter('scayt_auto_startup');
				settings.scayt_customer_id = getParameter('scayt_customer_id');
				settings.scayt_context_moresuggestions = isAllowable("scayt_context_moresuggestions") ? getParameter("scayt_context_moresuggestions") : "off";
				settings.scayt_custom_url = getParameter('scayt_custom_url');
				settings.scayt_slang = getParameter('scayt_slang');

				settings.scayt_custom_dic_ids = getParameter('scayt_custom_dic_ids');
				settings.scayt_user_dic_name = getParameter('scayt_user_dic_name');
				settings.scayt_service_protocol = getParameter('scayt_service_protocol');
				settings.scayt_service_host = getParameter('scayt_service_host');
				settings.scayt_service_port = getParameter('scayt_service_port');
				settings.scayt_service_path = getParameter('scayt_service_path');

				settings.scayt_context_menu_items_order = getParameter('scayt_context_menu_items_order');
				settings.scayt_context_menu_items_order = settings.scayt_context_menu_items_order.replace(/\s?[\|]+/g, ' ');

			},
			init: function(editor) {
				var self = this,
					ed = editor,
					settings = ed.settings;

				self.parseOptions(ed);

				ed.on('init', function(e) {
					var editor = e.target;

					var check = window.setInterval(function() {
						if (!editor.inline && editor.settings.scayt_auto_startup && !tinymce.isLoadingStarted) {
							clearInterval(check);
							toolbarButton.toggleStateMenuSelect(editor);
						}
					},0);
				});

				// disabled scayt button when editor inline
				if (editor.inline) {
					ed.on('focusin', function(e) {
						toolbarButton.scaytButton.disabled(true);
					});
				}

				ed.on('onScaytReady', function(ed) {
					var editor = ed;
	
					if (editor.settings.scayt_auto_startup) {
						for(var i = 0; i < scayt.startingStack.length; i++){
							scayt.createScayt(tinymce.editors[scayt.startingStack[i]]);
						}
						scayt.startingStack = [];

					}else {
						scayt.createScayt(editor);
					}

				});
			}
		};

		var toolbarButton = {
			scaytButton: null,
			createToolBarButton: function(editor) {
				var self = this;

				editor.addButton('scayt', {
					type: 'splitbutton',
					role: 'splitbutton',
					tooltip: 'SpellCheckAsYouType',
					disabled: false,
					menu: self.renderItemMenu(editor),
					icon: 'spellchecker',
					onpostrender: function() {
						self.scaytButton = this;
					},
					onshow: function(data) {
						self.findOutStatusMenu(data.control, this);
					},
					onclick: function(data) {
						self.toggleStateMenuSelect(editor);
					}
				});
			},
			renderItemMenu: function(editor) {
				var items = [],
					each = tinymce.each,
					ed = editor,
					settings = ed.settings,
					showUITab = settings.scayt_ui_tabs;

				settings.scayt_ui_tabs = utils.getParameter('scayt_ui_tabs');	
				showUITab = settings.scayt_ui_tabs.split(",");

				each(definitionDialog.menu, function(menuItem, index) {

					if (menuItem.identification && !!parseInt(showUITab[index])) {
						menuItem.menuItemIndex = items.length;
						items.push(menuItem);
					} else if(menuItem.identification == 'about'){
						menuItem.menuItemIndex = (items.length === 0) ?  0 : items.length;
						items.push(menuItem);
					}

				});

				return items;
			},
			toggleStateMenuSelect: function(editor) {
				var self = this,
					button = self.scaytButton,
					menu = self.scaytButton.menu;

				if (scayt.isScaytEnabled(editor)) {
					scayt.destroy(editor);
					button.active(false);
					self.findOutStatusMenu(menu, button);
				} else {
					scayt.loadScaytLibriary(editor);
					button.active(true);
					self.findOutStatusMenu(menu, button);
					contextMenu.create(editor);
				}
			},
			findOutStatusMenu: function(aControl, aMenu) {
				var items = aControl ? aControl._items : {},
					stateMenu = aMenu.active() ? false : true;

				tinymce.each(items, function(aElement){
					aElement.disabled(stateMenu);
				});
				return !stateMenu;
			},
			init: function(editor) {
				var self = this;
				self.createToolBarButton(editor);
				options.init(editor);

				// Remove SCAYT markup with undo level
				editor.on('BeforeAddUndo', function(e){
					if (e.lastLevel && e.lastLevel.content) {
						e.lastLevel.content = scayt.removeMarkupFromString(editor, e.lastLevel.content);
					}
					e.level.content = scayt.removeMarkupFromString(editor, e.level.content);
				});
			}
		};

		editor.on('SetContent', function(data) {

			var scaytInstance = scayt.getScayt(editor);
			if (!scaytInstance || scaytInstance.enabled === false){
				return;
			}

			if (data['content']) {
				data['content'] = scayt.removeMarkupFromString(editor, data['content']);
			}

			scaytInstance.fire("startSpellCheck");
		});

		editor.on('GetContent', function(data) {
			data.preventDefault();

			var scaytInstance = scayt.getScayt(editor);
			if (!scaytInstance || scaytInstance.enabled === false){
				return;
			}

			if (data['content']) {
				data['content'] = scayt.removeMarkupFromString(editor, data['content']);
			}
		});

		editor.on('pastepreprocess', function(data) {

			var scaytInstance = scayt.getScayt(editor);
			if (!scaytInstance || scaytInstance.enabled === false){
				return;
			}
			
			data.content = scayt.removeMarkupFromString(editor, data.content);
			scaytInstance.fire("startSpellCheck");
		});

		editor.on('NodeChange', function(e) {
			var ed = editor, temp = [];

			if (e.element && e.element.nodeName == 'SPAN' && e.element.className == 'red') {

				tinymce.each(e.parents, function(item) {
					if (!(item.nodeName == 'SPAN' && item.className == 'red')) {
						temp.push(item);
					}
				});

				e.element = e.element.parentNode;
				e.parents = temp;
			}
		});

		editor.on('remove', function() {
			var scaytInstance = scayt.getScayt(editor);
			return scaytInstance.destroy(editor);
		});

		var contextMenu = {
			originalMenu: undefined,
			contextmenu: null,
			menu: null,
			items: [],
			pos: null,
			createScaytMenuItem: function() {
				/* 	this method creates contextmenu item in original menu
					and will be always invisible
					Created to save link of original tinymce contextmenu.
				*/ 
				editor.addMenuItem('scayt', {
					context: 'scayt3t',
					text: 'SCAYT',
					onPostRender: function() {
						this.visible(false);
						contextMenu.originalMenu = this._parent;
					}
				});
			},
			destroy: function(editor) {
				var self = this,
					ed = editor;

				if (self.menu !== null) {
					self.menu.remove();
				}
				self.menu = null;
			},
			create: function(editor) {
				var self = this,
					ed = editor,
					settings = ed.settings,
					command = '',
					scaytInstance = null,
					word = null,
					wrapMenu = null,
					suggestions,
					moreSuggestions,
					needSuggestions,
					maxSuggestions = settings.scayt_max_suggestion = utils.isNegative(utils.getParameter('scayt_max_suggestion')) ? options.definitionDefaultOption['scayt_max_suggestion']['default'] : utils.getParameter('scayt_max_suggestion');

				ed.on('contextmenu', function(e) {
					e.preventDefault();
					if (!!editor.settings.readonly) {
						return;
					}

					scaytInstance = scayt.getScayt(ed);
					word = utils.getSelectionWord(scaytInstance);

					if (!word) {
						return;
					}

					scaytInstance.fire("getSuggestionsList", { lang: scayt.getCurrentLanguage(ed), word: word });

					suggestions = scayt.suggestions.slice(0, maxSuggestions);
					moreSuggestions = scayt.suggestions.slice(maxSuggestions, 15);

					needSuggestions = settings.scayt_context_moresuggestions !== 'on' ? false : suggestions[0] == 'no_any_suggestions' || moreSuggestions[0] == 'no_any_suggestions' ? false : ' moreSuggestions';

					utils.generateMenuItemsForSuggestion(suggestions);
					utils.generateMoreSuggestionsItem(moreSuggestions);
					utils.registerControlItems();

					settings.scayt_context_commands = utils.getParameter('scayt_context_commands');
					if(settings.scayt_context_commands === "all") {
						settings.scayt_context_commands = options.definitionDefaultOption['scayt_context_commands']['default'];
					} else if(settings.scayt_context_commands === "off") {
						settings.scayt_context_commands = "";
					} else {
						settings.scayt_context_commands = settings.scayt_context_commands.replace(/\s?[\|]+/gi, ' ');
					}

					var 	control = settings.scayt_context_commands + ' | aboutscayt |',
						suggest = suggestions.join(" ") + ' | ',
						moresuggest = !needSuggestions ? '' : needSuggestions + ' | ';

					self.contextmenu = settings.scayt_context_menu_items_order.replace('control', control).replace('moresuggest', moresuggest).replace('suggest', suggest);
					self.contextmenu = editor.settings.contextmenu.replace('scayt', self.contextmenu);

					// Render menu
					self.items = [];

					tinymce.each(self.contextmenu.split(/[ ,]/), function(name) {
					var item = ed.menuItems[name];

						if (name == '|') {
							item = {text: name};
						}

						if (item) {
							item.shortcut = ''; // Hide shortcuts
							self.items.push(item);
						}
					});

					for (var i = 0; i < self.items.length; i++) {
						if (self.items[i].text == '|') {
							if (i === 0 || i == self.items.length - 1) {
								self.items.splice(i, 1);
							}
						}
					}
				
					self.menu = new tinymce.ui.Menu({
						items: self.items,
						context: 'scayt',
						onCancel: function() {
							if (self.menu) {
								self.menu.hide();
								self.menu = undefined;
							}
						}
					});

					contextMenu.originalMenu.hide();
					self.menu.renderTo(document.body);

					var menuEl = self.menu.getEl();

					if (!tinymce.isIE) {
						 menuEl.style.maxHeight = 'inherit';
						 menuEl.style.position = 'absolute';
						 menuEl.style.overflow = 'visible';
					} else {
						menuEl.style.height = 'auto';

						if (window.JSON) {
							menuEl.style.maxHeight = 'inherit';
							menuEl.style.overflow = 'inherit';
						}
					}
					
					wrapMenu = '#' + self.menu._id;

					scaytInstance.showBanner(wrapMenu);
					self.menu.show();

					// Position menu
					self.pos = {x: e.pageX, y: e.pageY};

					if (!ed.inline) {
						self.pos = tinymce.DOM.getPos(ed.getContentAreaContainer());
						self.pos.x += e.clientX;
						self.pos.y += e.clientY;
					}

					self.menu.moveTo(self.pos.x, self.pos.y);

					ed.on('remove', function() {
						self.menu.remove();
						self.menu = null;
					});

					return false;
				});
				

			}
		};

		var utils = {
			isInteger: function(num){
			  return (num ^ 0) === num;
			},
			isNegative: function(num) {
				return num < 0 ? true : false;
			},
			getParameter: function(optionName) {
				var optionDefinition = options.definitionDefaultOption;
					optionName = optionName + '';

				if(!optionDefinition[optionName]) {
					return editor.getParam(optionName);
				}

				var checkType = function(name){
					return (typeof editor.getParam(name) === optionDefinition[name]['type']);
				};

				return checkType(optionName) ? editor.getParam(optionName) : optionDefinition[optionName]['default'];
			},
			isAllowable: function(optionName){
				var optionDefinition = options.definitionDefaultOption;

				return  (utils.getParameter(optionName) in optionDefinition[optionName]["allowable"]);
			},
			getLang: function(name, defaultVal) {
				var self = this;
				return editor.editorManager.i18n.translate(name) !== name ? editor.editorManager.i18n.translate(name) : defaultVal || name;
			},
			getTranslate: function(aString) {
				return editor.editorManager.i18n.translate(aString);
			},
			getSelectionWord: function(scaytInstance){
				if(!scaytInstance.enabled){
					return false;
				}
				
				var selectionNode = scaytInstance.getSelectionNode(),
					word;

				if(selectionNode) {
					word = selectionNode.getAttribute(scaytInstance.getNodeAttribute());
				} else {
					word = selectionNode;
				}

				return word;
			},
			registerMenuItem: function(name, itemDefinition){
				editor.addMenuItem(name, itemDefinition);
			},
			// TODO: refactor this code
			addUndoLevelAfterReplaceCommand: function(editor) {
				var self = this,
					undo = editor.undoManager;

				undo.add();
			},
			generateReplaceCommand: function(scaytInstance, suggestion){
				var replacement = suggestion,
					self = this;
				return function(){
					editor.focus(); // ~ fix bug with focus
					scaytInstance.replaceSelectionNode({ word: replacement });
					self.addUndoLevelAfterReplaceCommand(editor);
				};
			},
			generateMenuItemsForSuggestion: function(suggestions /*Array*/){
				var scaytInstance = scayt.getScayt(editor);

				for(var i = 0; i < suggestions.length; i++){
					this.registerMenuItem(suggestions[i], {
						text: suggestions[i],
						onclick: this.generateReplaceCommand(scaytInstance, suggestions[i])
					});
				}
			},
			generateSubMenuForMoreSuggestions: function(suggestions /*Array*/){
				var scaytInstance = scayt.getScayt(editor),
					menuList = [];

				for(var i = 0; i < suggestions.length; i++){
					menuList.push({
						text: suggestions[i],
						onclick: this.generateReplaceCommand(scaytInstance, suggestions[i])
					});
				}

				return menuList;
			},
			generateMoreSuggestionsItem: function(suggestions /*Array*/){
				var self = this,
					listItem;

				if (self.generateSubMenuForMoreSuggestions(suggestions)[0] && self.generateSubMenuForMoreSuggestions(suggestions)[0].text) {
					listItem = self.generateSubMenuForMoreSuggestions(suggestions)[0].text == 'no_any_suggestions' ? null : self.generateSubMenuForMoreSuggestions(suggestions);
				}

				if (listItem === null) {
					return;
				}
					
				editor.addMenuItem('moreSuggestions', {
					text: utils.getLang('cm_more_suggestions','More suggestions'),
					menu: listItem
				});
			},
			registerControlItems: function() {
				editor.addMenuItem('ignore', {
					text: utils.getLang('cm_ignore_word','Ignore'),
					onclick: function(){
						var scaytInstance = scayt.getScayt(editor);
						scaytInstance.ignoreWord();
					}
				});

				editor.addMenuItem('ignoreall', {
					text: utils.getLang('cm_ignore_all','Ignore all'),
					onclick: function(){
						var scaytInstance = scayt.getScayt(editor);
						scaytInstance.ignoreAllWords();
					}
				});

				editor.addMenuItem('add', {
					text: utils.getLang('cm_add_word','Add word'),
					onclick: function(){
						var scaytInstance = scayt.getScayt(editor);
						scaytInstance.addWordToUserDictionary();
					}
				});

				editor.addMenuItem('aboutscayt', {
					text: utils.getLang('cm_about','About SCAYT'),
					onclick: function(data){
						var scayt_ui_tabs = editor.settings && typeof editor.settings.scayt_ui_tabs === 'string' ? editor.settings.scayt_ui_tabs.split(",") : editor.settings.scayt_ui_tabs,
							aboutTabIndex = scayt_ui_tabs.length;

						tinymce.each(scayt_ui_tabs, function(item) {
							if (scayt_ui_tabs.length !== 0 && parseInt(item) === 0) {
								aboutTabIndex--;
							}
						});

						definitionDialog.openDialog(editor, data, aboutTabIndex);
					}
				});

				editor.addMenuItem('no_any_suggestions', {
					text: 'No suggestions',
					onPostRender: function(data){
						data.control.disabled(true);
					},
					onclick: function(){
						return;
					}
				});
			},
			registerLanguages: (function() {
				var langList = {},
					codeList = {},
					getToName,
					getToCode,
					makeLanguageList;

				getToName = function(aLangCode) {
					var langCode = typeof aLangCode === 'string' ? aLangCode : '"' + aLangCode + '"';
					
					if (codeList.hasOwnProperty(langCode)) {
						return codeList[langCode];
					}
				};
				getToCode = function(aLangName) {
					 var langName = typeof aLangName === 'string' ? aLangName : '"' + aLangName + '"';

					for (var code in codeList) {
						if (codeList[code] == langName) {
							return code;
						}
					}		
				};
				makeLanguageList = function(aLangList) {
					langList = aLangList;

					for (var langGroup in langList) {
						if (langList.hasOwnProperty(langGroup)) {
							for (var langCode in langList[langGroup]) {
								codeList[langCode] = langList[langGroup][langCode];
							}
						}
					}
					return codeList;
				};
				return {
					getToName: getToName,
					getToCode: getToCode,
					makeLanguageList: makeLanguageList
				};
			})()
		};

		var definitionDialog = {
			dictionaryButtons: [],
			definitionDataControl: {
				nodes: {},
				setInstances: function(data, name) { 
					return this.nodes[name] = data;
				},
				getInstances: function(name) {
					return this.nodes[name];
				}
			},
			langState: {
				isChanged: function() {
					return (this.selectLang === null || this.currentLang === this.selectLang) ? false : true;
				},
				currentLang: null,
				selectLang: null,
				id: 'lang'
			},
			getChangedOptions: function() {
				var optionsList = this,
					changedOptions = {};

				for (var item in optionsList) {
					if (optionsList.hasOwnProperty(item)) {
						changedOptions[item] = optionsList[item];
					}
				}

				if (definitionDialog.langState.isChanged()) {
					changedOptions[definitionDialog.langState.id] = definitionDialog.langState.selectLang;
				}

				return changedOptions;
			},
			menu: [
				{
					text: utils.getLang('tb_menu_options','SCAYT Options'),
					identification: 'options',
					menuItemIndex: 0,
					onclick: function(data){
						definitionDialog.openDialog(editor, data, this.settings.menuItemIndex);
					}
				},
				{
					text: utils.getLang('tb_menu_languages','SCAYT Languages'),
					identification: 'languages',
					menuItemIndex: 1,
					onclick: function(data){
						definitionDialog.openDialog(editor, data, this.settings.menuItemIndex);
					}
				},
				{
					text: utils.getLang('tb_menu_dictionaries','SCAYT Dictionaries'),
					identification: 'dictionary',
					menuItemIndex: 2,
					onclick: function(data){
						definitionDialog.openDialog(editor, data, this.settings.menuItemIndex);
					}
				},
				{
					text: utils.getLang('tb_menu_about','About SCAYT'),
					identification: 'about',
					menuItemIndex: 3,
					onclick: function(data){
						definitionDialog.openDialog(editor, data, this.settings.menuItemIndex);
					}
				}
			],
			generateOptionsCheckbox: function(aOptionsList) {
				var createCheckbox, optionList = aOptionsList || {};

				createCheckbox = [
					{checked: false, name: "ignore-all-caps-words", text: utils.getLang('label_allCaps','Ignore All-Caps Words')},
					{checked: false, name: 'ignore-domain-names', text: utils.getLang('label_ignoreDomainNames','Ignore Domain Names')},
					{checked: false, name: 'ignore-words-with-mixed-cases', text: utils.getLang('label_mixedCase','Ignore Mixed-Case Words')},
					{checked: false, name: 'ignore-words-with-numbers', text: utils.getLang('label_mixedWithDigits','Ignore Words with Numbers')}
				];

				for (var i = 0; i < createCheckbox.length; i++) {
					createCheckbox[i].checked = optionList[createCheckbox[i].name];
				}

				return createCheckbox;
			},
			generateLanguagesCheckbox: function(aLanguages, aCurrentLanguage) {
				var createCheckbox = [],
					renderLang,
					languageList = aLanguages || {},
					currentLang = aCurrentLanguage || 'en_US';
				
				this.langState.currentLang = currentLang;

				languageList = utils.registerLanguages.makeLanguageList(languageList);
				
				for (var langName in languageList) {
					createCheckbox.push({
						checked: langName === currentLang ? true : false,
						name: langName,
						role: langName,
						text: languageList[langName]
					});
				}

				return createCheckbox;
			},
			generateDictionaryButtons: function() {
				var buttons = [
					{disabled: true, name: "Create", role: 'Create', text: utils.getLang('dic_create','Create')},
					{disabled: true, name: 'Restore', role: 'Restore', text: utils.getLang('dic_restore','Restore')},
					{disabled: true, name: 'Rename', role: 'Rename', text: utils.getLang('dic_rename','Rename')},
					{disabled: true, name: 'Remove', role: 'Remove', text: utils.getLang('dic_remove','Remove')}
				];
				return buttons;
			},
			setDictionaryButtons: function() {
				var self = this;
				self.removeDictionaryButtons();
				self.definitionDataControl.getInstances('dic_buttons').append(self.getDictionaryButtons());
			},
			getDictionaryButtons: function() { 
				var self = this;
				return self.dictionaryButtons;
			},	
			removeDictionaryButtons: function() {
				var self = this,
					items = self.definitionDataControl.getInstances('dic_buttons').items();

				for (var i = items.length - 1; i >= 0; i--) {
					items[i].remove();
				}
			},
			toggleDictionaryButtons: function(aIds) {
				var self = this,
					items = self.generateDictionaryButtons(),
					showItems = aIds.split('|') || '';

				for (var i = 0; i < showItems.length; i++) {
					for (var j = 0; j < items.length; j++) {
						if(items[j].name == showItems[i]) {
							items[j]['disabled'] = false;
						}
					}
				}

				self.dictionaryButtons = items;
			},
			initDictionaryNameAndButtons: function(dicName) {
				var self = this, 
					dictionaryValue = '',
					dictionaryButtonLocation = [
						"Create|Restore",
						"Rename|Remove"
					];

				if (dicName !== undefined && dicName !== "null" && dicName !== "") {
					dictionaryValue = dicName;
					self.toggleDictionaryButtons(dictionaryButtonLocation[1]);
				} else {
					dictionaryValue = '';
					self.toggleDictionaryButtons(dictionaryButtonLocation[0]);		
				}

				return dictionaryValue;
			},
			handlerDictionaryButtons: function(data) {
				var self = this;

				if (data && data.target.tagName === 'BUTTON' && data.control.disabled() !== true) {
					var cmd = data.control.aria('role').toLowerCase();
					self.manageCommandButtons[cmd]();
				}
			},
			dicEmptyMessage: function() {
				return !document.getElementById('messageBox').innerHTML;
			},
			dicSuccessMessage: function(message) {
				 if (message) {
					document.getElementById('messageBox').style.color = "green";
					document.getElementById('messageBox').innerHTML = message;
				 }
				 return '';
			},
			dicErrorMessage:  function(message) {
				if (message) {
					document.getElementById('messageBox').style.color = "red";
					document.getElementById('messageBox').innerHTML = message;
				 }
				 return '';
			},
			removeMessage: function() {
				var self = this;
				self.dicEmptyMessage();
			},
			manageCommandButtons: {
				create: function() {
					var self = this;
					var scayt_control = scayt.getScayt(editor);
					var err_massage = utils.getLang('dic_err_dic_create', 'The Dictionary %s cannot be created');
					var suc_massage = utils.getLang('dic_succ_dic_create', 'The Dictionary %s has been successfully created');

					scayt_control.createUserDictionary(definitionDialog.getDictionaryName(), function(response){

						definitionDialog.initDictionaryNameAndButtons(response.name);
						if(!response.error){
							definitionDialog.setDictionaryButtons();
							suc_massage = suc_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.dicSuccessMessage(suc_massage);
						}else{
							definitionDialog.setDictionaryButtons();
							err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.dicErrorMessage( err_massage );
						}

					}, function(error){
						err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
						definitionDialog.dicErrorMessage( err_massage );
					});
				},
				restore: function() {
					var self = this;
					var scayt_control = scayt.getScayt(editor);
					var err_massage = utils.getLang('dic_err_dic_restore', 'The Dictionary %s cannot be restored');
					var suc_massage = utils.getLang('dic_succ_dic_restore', 'The Dictionary %s has been successfully restored');

					scayt_control.restoreUserDictionary(definitionDialog.getDictionaryName(), function(response){

						definitionDialog.initDictionaryNameAndButtons(response.name);
						if(!response.error){
							definitionDialog.setDictionaryButtons();
							suc_massage = suc_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.dicSuccessMessage(suc_massage);
						}else{
							definitionDialog.setDictionaryButtons();
								err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
								definitionDialog.dicErrorMessage( err_massage );
						}
					}, function(error){
							err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.dicErrorMessage( err_massage );
					});
				},
				rename: function() {
					var self = this;
					var scayt_control = scayt.getScayt(editor);
					var err_massage = utils.getLang('dic_err_dic_rename', "The Dictionary %s cannot be renamed");
					var suc_massage = utils.getLang('dic_succ_dic_rename', 'The Dictionary %s has been successfully renamed');

					scayt_control.renameUserDictionary(definitionDialog.getDictionaryName(), function(response){

						definitionDialog.initDictionaryNameAndButtons(response.name);
						if(!response.error){
							definitionDialog.setDictionaryButtons();
							suc_massage = suc_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.setDictionaryName(definitionDialog.getDictionaryName());
							definitionDialog.dicSuccessMessage(suc_massage);
						}else{
							err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.dicErrorMessage( err_massage );
						}
						
					}, function(error){
							err_massage = err_massage.replace("%s" , ('"'+definitionDialog.getDictionaryName()+'"') );
							definitionDialog.setDictionaryName(definitionDialog.getDictionaryName());
							definitionDialog.dicErrorMessage( err_massage );  
					});
				},
				remove: function() {
					var self = this;
					var scayt_control = scayt.getScayt(editor);
					var err_massage = utils.getLang('dic_err_dic_remove', 'The Dictionary %s cannot be removed');
					var suc_massage = utils.getLang('dic_succ_dic_remove', 'The Dictionary %s has been successfully removed');

					scayt_control.removeUserDictionary(definitionDialog.getDictionaryName(), function(response){
						
						definitionDialog.resetDictionaryName();
						definitionDialog.initDictionaryNameAndButtons(definitionDialog.getDictionaryName());
					   
						if(!response.error) {
							definitionDialog.setDictionaryButtons();
							suc_massage = suc_massage.replace("%s" , ('"'+ response.name +'"') );
							definitionDialog.dicSuccessMessage(suc_massage);
						} else {
							err_massage = err_massage.replace("%s" , ('"'+ response.name +'"') );
							definitionDialog.dicErrorMessage( err_massage );   
						}
						
					}, function(error){
							err_massage = err_massage.replace("%s" , ('"'+ definitionDialog.getDictionaryName() +'"') );
							definitionDialog.dicErrorMessage( err_massage );   
					});	
				}
			},
			getDictionaryName: function() {
				var self = this;
				return self.definitionDataControl.getInstances('dic_textarea').value();		
			},
			setDictionaryName: function(dictionaryName) {
				var self = this;
				dictionaryName = dictionaryName || '';
				return self.initDictionaryNameAndButtons(dictionaryName);
			},
			resetDictionaryName: function(name) {
				var self = this;
				name = name || '';
				return self.definitionDataControl.getInstances('dic_textarea').value(name);
			},
			definitionWindowDialog: function(editor) {
				var self = this,
					items = [],
					each = tinymce.each,
					tabs = null,
					ed = editor,
					settings = ed.settings,
					showUITab = settings.scayt_ui_tabs = utils.getParameter('scayt_ui_tabs');
					showUITab = (typeof showUITab === 'object') ? showUITab : showUITab.split(",");

				tabs = [
					{
						title: utils.getLang('tab_options','Options'),
						type: 'form',
						role: 'scayt_options',
						identification: 'options',
						minWidth: 450,
						minHeight: 300,
						defaults: {
							type: 'checkbox',
							role: 'checkbox',
							style: 'overflow: hidden; cursor: pointer;'
						},
						items: definitionDialog.generateOptionsCheckbox(scayt.getOptions(ed))
					},
					{
						title: utils.getLang('tab_languages','Languages'),
						type: 'form',
						pack: 'start',
						role: 'scayt_language',
						identification: 'language',
						items: [
							{
								type: 'container',
								role: 'container',
								layout: 'grid',
								packV: 'start',
								columns: 2,
								spacing: 10,
								alignH: ['50%', '50%'],
								defaults: {
									type: 'checkbox',
									role: 'checkbox',
									label: ' ',
									style: 'overflow: hidden; cursor: pointer;'
								},
								items: definitionDialog.generateLanguagesCheckbox(scayt.getLanguages(ed), scayt.getCurrentLanguage(ed)),
								onClick: function(data) {
									var control = data.control,
										items;

									if(data && control.aria('role') != "container"){
										if (control.checked()) {
											items = control.parent().toJSON();

											for (var item in items) {
												items[item] = false;
											}

											items[control.aria('role')] = true;
											definitionDialog.langState.selectLang = control.aria('role');
											control.parent().fromJSON(items);
										}
									}
									
								}
							}
						]
					},
					{
						title: utils.getLang('tab_dictionaries','User dictionaries'),
						type: 'form',
						pack: 'start',
						role: 'scayt_dictionary',
						identification: 'dictionary',
						items: [
							{
								label: utils.getLang('dic_dictionary_name','Dictionary Name'),
								type: 'textbox', 
								role: 'dic_textbox',
								value: definitionDialog.setDictionaryName(scayt.getUserDictionaryName(ed)),
								onPostRender: function(data) {
									definitionDialog.definitionDataControl.setInstances(data.control, 'dic_textarea');
								}
							},
							{
								type: 'container',
								role: 'container',
								defaults: {
									type: 'button',
									role: 'button',
									style: 'margin-right: 6px; z-index:2;'
								},
								items: definitionDialog.getDictionaryButtons(),
								onPostRender: function(data) {
									definitionDialog.definitionDataControl.setInstances(data.control, 'dic_buttons');
								},
								onClick: function(data) {
									definitionDialog.handlerDictionaryButtons(data);
								}
							},
							{
								type: 'fieldset',
								role: 'fieldset',
								style: 'border: none;padding-top: 20px;',
								html: '<div id="infoBlock" style="white-space: normal;text-align: justify;"><div id="messageBox"></div>'+
											utils.getLang('dic_about_info','Initially a User Dictionary is stored in a cookie. However, cookies are limited in size. When a User Dictionary grows to a point where it cannot be stored in a cookie, the dictionary may be stored on our server. To store your personal dictionary on our server, you should specify a name for it. If you already have a stored dictionary, please type its name and click the Restore button.')											  
									+'</div>'
							}

						]
					},
					{
						title: utils.getLang('tab_about','About SCAYT'),
						type: 'form',
						role: 'scayt_about',
						identification: 'about',
						items: [
							{
								type: 'container',
								role: 'container',
								style: 'padding: 10px; min-width: 300px;',
								html: '<div style="white-space: normal;">'+ self.aboutTemplate() +'</div>'
							}
						]
					}
				];

				// Create tab list with depends on scayt_ui_tabs settings
				each(tabs, function(tab, index) {
					if (tab.identification && !!parseInt(showUITab[index])) {
						items.push(tab);
					} else if(tab.identification == 'about'){
						items.push(tab);
					}
				});

				return items;
			},
			openDialog: function(aEditor, aData, aIdOpenTab) {
				var self = this,
					openTabWithId = aIdOpenTab || 0;		

				return aEditor.windowManager.open({
					title: utils.getLang('title','SpellCheckAsYouType'),
					data: aData,
					minWidth: 450,
					minHeight: 300,
					resizable: 'true',
					role: 'tabpanel',
					bodyType: 'tabpanel',
					onPostRender: function(data){
						var self = this,
							titleContainerId = this._id + '-head',
							titleContainer = document.getElementById(titleContainerId),
							title = titleContainer.getElementsByTagName('DIV');
						
						// Create small font for header dialog window
						for (var i = title.length - 1; i >= 0; i--) {
							if (title[i].className == 'mce-title') {
								title[i].style.fontSize = '15px';
							}
							continue;
						}

						// Opening tab depends on the selected menu item
						//if (openTabWithId !== 0) {
							self.items()[0].activateTab(openTabWithId);
						//};

						self.focus();

					},
					onSubmit: function(data) {
						var scayt_instance = scayt.getScayt(editor);
						var changedOptions = definitionDialog.getChangedOptions.call(data.data);
						scayt_instance.commitOption({changedOptions: changedOptions});
					},
					body: self.definitionWindowDialog(editor)
				});
			},
			aboutTemplate: function() {
				var scayt_instance = scayt.getScayt(editor);
				return '<div id="scayt_about" style="padding: 15px;"><a href="http://webspellchecker.net" alt="WebSpellChecker.net"><img title="WebSpellChecker.net" src="' + scayt_instance.getLogo(editor) + '" style="padding-bottom: 15px;" /></a><br />' + scayt_instance.getLocal('version') + scayt.getVersion(editor) + ' <br /><br /> '+ utils.getLang('about_throwt_copy', "&copy; 1999-2013 SpellChecker.net, All Rights Reserved.") +'</div>';
			}
		};

		var scayt = {
			toolbarScaytTabs: null,
			isLoadingStarted: false,
			defaultScript: editor.settings.scayt_custom_url,
			startingStack: [],
			onScaytReady: false,
			isScaytReady: false,
			suggestions: [],
			loaded: false,
			isScriptLoaded: function(){
				var self = this;
				var scripts = dom.doc.getElementsByTagName("script");

				
				for(var i = 0; i < scripts.length; i++ ){
					if(scripts[i].src == editor.settings.scayt_custom_url){
						return true;
					}
				}

				return false;
			},
			loadScaytLibriary: function(ed){
				var self = this,
					editor = ed,
					protocol = document.location.protocol,
					baseUrl  = editor.settings.scayt_custom_url;

				protocol = protocol.search( /https?:/) != -1? protocol : 'http:';
				baseUrl = baseUrl.search(/^\/\//) === 0 ? protocol + baseUrl : baseUrl;

				var pushInStartingStack = function(editor, scope) {
					var that = scope;

					if(editor.settings.scayt_auto_startup){
						that.startingStack.push(editor.id);
					}
				};

				// script it is not loaded
				if(!self.isScriptLoaded() && (typeof window.SCAYT === "undefined" || (typeof window.SCAYT !== "undefined" && typeof window.SCAYT.TINYMCE !== "function")) && !self.isScaytReady && !tinymce.isLoadingStarted){

					var scriptLoader = new tinymce.dom.ScriptLoader();

					tinymce.isLoadingStarted = true;
					scriptLoader.add(baseUrl);
					scriptLoader.loadQueue(function(){
						pushInStartingStack(editor, self);
						self.isScaytReady = true;
						tinymce.isLoadingStarted = false;
						editor.fire('onScaytReady', editor);
					});

				// script it is loaded
				}else if(typeof window.SCAYT !== "object" &&  typeof window.SCAYT !== "undefined" && typeof window.SCAYT.TINYMCE === "function"){

					pushInStartingStack(editor, self);
					editor.fire('onScaytReady', editor);

				}else if(tinymce.isLoadingStarted){

					pushInStartingStack(editor, self);
				}
				
			},
			createScayt : function( editor ) {
				var self = this,
					_scaytInstance = {};

				if(self.getScayt(editor).enabled) {
					return;
				}

				var _scaytInstanceOptions = {
					debug 				: editor.settings.scayt_debug || false,
					lang 				: editor.settings.scayt_slang,
					container 			: (editor.getContentAreaContainer() && editor.getContentAreaContainer().children[0]) ? editor.getContentAreaContainer().children[0] : editor.getElement(),
					customDictionary	: editor.settings.scayt_custom_dic_ids,
					userDictionaryName 	: editor.settings.scayt_user_dic_name,
					localization		: editor.langCode,
					customer_id			: editor.settings.scayt_customer_id
				};

				var t = editor.settings.scayt_service_protocol;
				if (editor.settings.scayt_service_protocol) {
					_scaytInstanceOptions['service_protocol'] = editor.settings.scayt_service_protocol;
				}

				if (editor.settings.scayt_service_host) {
					_scaytInstanceOptions['service_host'] = editor.settings.scayt_service_host;
				}

				if (editor.settings.scayt_service_port) {
					_scaytInstanceOptions['service_port'] = editor.settings.scayt_service_port;
				}

				if (editor.settings.scayt_service_path) {
					_scaytInstanceOptions['service_path'] = editor.settings.scayt_service_path;
				}
				
				_scaytInstance = new SCAYT.TINYMCE(_scaytInstanceOptions,
					function() {
						_scaytInstance.enabled = true;
					},
					function() {

				});

				_scaytInstance.subscribe("suggestionListSend", function(data) {
					// TODO: maybe store suggestions for specific editor 
					self.suggestions = data.suggestionList;
				});
				//_scaytInstance.enabled = !_scaytInstance.enabled || true;
				
				if(typeof tinymce.editors[editor.id].plugins["scayt"].instances !== "object"){
					tinymce.editors[editor.id].plugins["scayt"].instances = {};
				}
				tinymce.editors[editor.id].plugins["scayt"].instances[editor.id] = _scaytInstance;
			},
			destroy: function(editor) {
				var self = this,
					scaytInstance = self.getScayt(editor);

				if(scaytInstance.enabled !== false) {	
					scaytInstance.destroy();
				}
			},
			getScayt : function( editor ) {	
				var scaytInstance = false;
				
				if(editor.plugins["scayt"].instances) {
					scaytInstance =  editor.plugins["scayt"].instances[editor.id] || { enabled : false };	
				}

				return scaytInstance;
			},
			isScaytEnabled : function( editor ) {
				var scayt_instance = this.getScayt( editor );
				return !( scayt_instance && scayt_instance.enabled ) ? false : true;
			},
			getOptions: function(editor) {
				var scayt_instance = scayt.getScayt( editor );
				return scayt_instance.getApplicationConfig();
			},
			getCurrentLanguage: function(editor){
				var scayt_instance = this.getScayt( editor );
				return scayt_instance.getLang();
			},
			getLanguages: function(editor) {
				var scayt_instance = this.getScayt( editor );
				return scayt_instance.getLangList();
			},
			getUserDictionaryName: function(editor) {
				var scayt_instance = this.getScayt( editor );
				return scayt_instance.getUserDictionaryName();	
			},
			getVersion: function(editor) {
				var scayt_instance = this.getScayt( editor );
				return '3.0.0';
			},
			removeMarkupFromWord: function(editor) {
				var self = this,
					scaytInstance = self.getScayt(editor);

				if(scaytInstance.enabled !== false) {	
					scaytInstance.removeMarkupFromWord();
				}
			},
			removeMarkupFromString: function(editor, str) {
				var self = this,
					scaytInstance = self.getScayt(editor);

				if(scaytInstance && scaytInstance.enabled !== false) {
					return scaytInstance.removeMarkupFromString(str);
				}

				return str;
			},
			markupStarted: function(editor) { }
		};
		
		toolbarButton.init(editor);
		contextMenu.createScaytMenuItem();
	});
}());