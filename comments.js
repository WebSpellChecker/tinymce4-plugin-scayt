/**
 * @member TinyMCE4_SCAYT3_plug-in
 * @public
 *
 * @property {String} [scayt_contextCommands='ignoreall,add'] - The parameter customizes the display of SCAYT context menu commands ("Add Word", "Ignore"
 * and "Ignore All"). This must be a string with one of this words: 'off', 'all'; or combination of the following words: 'ignore,ignoreall,add' separated by a comma character (','):
 * 'off' &ndash; disables all options; 'all' &ndash; enables all options; 'ignore' &ndash; enables the "Ignore" option;
 * 'ignoreall' &ndash; enables the "Ignore All" option; 'add' &ndash; enables the "Add Word" option.
 * Old option name : scayt_context_commands
 *
 * @property {String} [scayt_sLang='en_US'] - The parameter sets the default spell checking language for SCAYT. Possible values are:
 * 'en_US', 'en_GB', 'pt_BR', 'da_DK',
 * 'nl_NL', 'en_CA', 'fi_FI', 'fr_FR',
 * 'fr_CA', 'de_DE', 'el_GR', 'it_IT',
 * 'nb_NO', 'pt_PT', 'es_ES', 'sv_SE'.
 * Old option name : scayt_slang
 *
 * @property {Number} [scayt_maxSuggestions=3] - The parameter defines the number of SCAYT suggestions to show in the main context menu.
 * Possible values are:
 * '0' (zero) &ndash; No suggestions are shown in the main context menu. All
 * entries will be listed in the the "More Suggestions" sub-menu.
 * Positive number &ndash; The maximum number of suggestions to show in the context
 * menu. Other entries will be shown in the "More Suggestions" sub-menu.
 * Negative number &ndash; 5 suggestions are shown in the main context menu. All other
 * entries will be listed in the the "More Suggestions" sub-menu.
 * Old option name : scayt_max_suggestion
 *
 * @property {Number} [scayt_minWordLength=3] - The parameter defines minimum length of the words that will be collected from editor's text for spell checking.
 * Possible value is any positive number.
 *
 * @property {String} [scayt_customDictionaryIds=''] - The parameter links SCAYT to custom dictionaries. This is a string containing dictionary IDs
 * separated by commas (',').
 * Further details at [link](@@BRANDING_CUSTOM_DICT_MANUAL_URL)).
 * Old option name : scayt_custom_dic_ids
 *
 * @property {String} [scayt_userDictionaryName=''] - The parameter activates a User Dictionary in SCAYT. The user
 * dictionary name must be used.
 * Old option name : scayt_user_dic_name
 *
 * @property {String} [scayt_uiTabs='1,1,1'] - The parameter customizes the SCAYT dialog and SCAYT toolbar menu to show particular tabs/items.
 * This setting must contain a '1' (enabled) or '0'
 * (disabled) value for each of the following entries, in this precise order,
 * separated by a comma (','): 'Options', 'Languages', and 'Dictionary'.
 * Old option name : scayt_ui_tabs
 *
 * @property {String} [scayt_serviceProtocol='http'] - The parameter allows to specify protocol for WSC service (ssrv.cgi) full path. Make sense only when you open your page from file system.
 * Otherwise SCAYT will try automatically define protocol based on script location
 * Old option name : scayt_service_protocol
 *
 * @property {String} [scayt_serviceHost='svc.webspellchecker.net'] - The parameter allows to specify host for WSC service (ssrv.cgi) full path. Make sense only when you open your page from file system.
 * Otherwise SCAYT will try automatically define host based on script location
 * Old option name : scayt_service_host
 *
 * @property {String} [scayt_servicePort='80'] - The parameter allows to specify default port for WSC service (ssrv.cgi) full path. If SCAYT willn't define port based on script location
 * then this value would be taken
 * Old option name : scayt_service_port
 *
 * @property {String} [scayt_servicePath='spellcheck31/script/ssrv.cgi'] - The parameter allows to specify path for WSC service (ssrv.cgi) full path. Make sense only when you open your page from file system.
 * Otherwise SCAYT will try automatically define path based on script location
 * Old option name : scayt_service_path
 *
 * @property {String} [scayt_moreSuggestions='on'] - The parameter enables/disables the "More Suggestions" sub-menu in the context menu.
 * Possible values are 'on' and 'off'.
 * Old option name : scayt_context_moresuggestions
 *
 * @property {String} [scayt_customerId='1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2'] - The parameter sets the customer ID for SCAYT. Required for migration from free,
 * ad-supported version to paid, ad-free version.
 * Old option name : scayt_customer_id
 *
 * @property {String} [scayt_srcUrl = '//svc.webspellchecker.net/spellcheck31/lf/scayt3/tinymce/tinymcescayt.js'] - The parameter sets the URL to SCAYT core. Required to switch to the licensed version of SCAYT application.
 * Further details available at [link](@@BRANDING_MIGRATION_MANUAL_URL)
 * Old option name : scayt_custom_url
 *
 * @property {Boolean} [scayt_auto_startup=false] - The parameter turns on/off SCAYT on the autostartup. If 'true', turns on SCAYT automatically after loading the editor.
 * Old option name : scayt_auto_startup
 *
 * @property {String} [scayt_contextMenuItemsOrder='suggest|moresuggest|control'] - The parameter defines the order SCAYT context menu items by groups.
 * This must be a string with one or more of the following
 * words separated by a pipe character ('|'):
 * 'suggest' &ndash; main suggestion word list;
 * 'moresuggest' &ndash; more suggestions word list;
 * 'control' &ndash; SCAYT commands, such as "Ignore" and "Add Word".
 * Old option name : scayt_context_menu_items_order
 *
 * @property {String} [scayt_elementsToIgnore='style'] - Specifies the names of tags that will be skipped while spell checking. It is a string containing tag names separated by commas (',').
 * Please note that 'style' tag would be added to specified tags list.
 *
 * @example
 * // Show "Add Word", "Ignore" and "Ignore All" in the context menu.
 * config.scayt_contextCommands = 'add,ignore,ignoreall';
 * @example
 * // Sets SCAYT to German.
 * config.scayt_sLang = 'de_DE';
 * @example
 * // Display only three suggestions in the main context menu.
 * config.scayt_maxSuggestions = 3;
 *
 * // Do not show the suggestions directly.
 * config.scayt_maxSuggestions = 0;
 * @example
 * // Set minimum length of the words that will be collected from text.
 * config.scayt_minWordLength = 5;
 * @example
 * config.scayt_customDictionaryIds = '3021,3456,3478"';
 * @example
 * config.scayt_userDictionaryName = 'MyDictionary';
 * @example
 * // Hides the "Languages" tab.
 * config.scayt_uiTabs = '1,0,1';
 * @example
 * // define protocol for WSC service (ssrv.cgi) full path
 * config.scayt_serviceProtocol='https';
 * @example
 * // define host for WSC service (ssrv.cgi) full path
 * config.scayt_serviceHost='my-host';
 * @example
 * // define port for WSC service (ssrv.cgi) full path
 * config.scayt_servicePort='2330';
 * @example
 * // define path for WSC service (ssrv.cgi) full path
 * config.scayt_servicePath='myPath/ssrv.cgi'
 * @example
 * // Disables the "More Suggestions" sub-menu.
 * config.scayt_moreSuggestions = 'off';
 * @example
 * // Load SCAYT using my customer ID.
 * config.scayt_customerId  = 'your-encrypted-customer-id';
 * @example
 * config.scayt_srcUrl = "http://my-host/spellcheck/lf/scayt/scayt.js";
 * @example
 * config.scayt_autoStartup = true;
 * @example
 * config.scayt_contextMenuItemsOrder = 'moresuggest|control|suggest';
 * @example
 * config.scayt_elementsToIgnore = 'del,pre';
 */