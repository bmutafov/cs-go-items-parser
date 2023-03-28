import fs from 'node:fs';

const ITEMS_GAME_TXT =
	'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\csgo\\scripts\\items\\items_game.txt';

function readFile() {
	const fileContent = fs.readFileSync(ITEMS_GAME_TXT);
	const fileContentString = fileContent.toString();
	console.log(`Read file ${ITEMS_GAME_TXT}: ${fileContent.byteLength} bytes`);
	return fileContentString;
}

/**
 * @param {string} content
 * @returns
 */
function parseFileToJson(content) {
	console.log('Parsing file to JSON...');
	return (
		content
			/**
			 * Replace all instances where a key is opening an object to a valid JSON.
			 * E.g.:
			 ** "items_game"
			 ** {
			 *
			 * to:
			 *
			 ** "items_game":
			 ** {           ^
			 */
			.replace(/\"\s*\{/g, '": {')
			/**
			 * Replace all instances of key-value properties and adds a semicolon between them.
			 * Matches two quotation marks next to each other, with whitespace between them, that is NOT a new line
			 * E.g:
			 ** "first_valid_class"		"2"
			 *
			 * to:
			 *
			 ** "first_valid_class": "2"
			 **                    ^
			 */
			.replace(/\"[^\S\r\n]*\"/g, '": "')
			/**
			 * Replace all closing quotation marks of values, with a quotation mark and a comma, so its valid JSON for next property
			 *
			 * E.g:
			 ** "first_valid_class": "2"
			 ** "last_valid_class": "3"
			 *
			 * to:
			 ** "first_valid_class": "2",
			 **                         ^
			 ** "last_valid_class": "3"
			 */
			.replace(/\"[^\S\r\n]*(\r\n|\r|\n)/g, '",')
			/**
			 * Since we added a comma after the closing quotation mark of all property values, we need to remove the comma on the last one.
			 * Hence, we match all quotes with a closing bracket after them, with some whitespace between:
			 * E.g.:
			 ** "num_item_presets": "4",
			 ** }
			 * to:
			 ** "num_item_presets": "4"
			 **                        ^
			 ** }
			 */
			.replace(/\,\s*\}/g, '}')
			/**
			 * Finally, replace all closing brackets before opening new keys, and add a comma in between
			 *
			 * E.g.:
			 ** ...
			 ** }
			 ** "rarities"
			 * to:
			 ** ...
			 ** },
			 **  ^
			 ** "rarities"
			 */
			.replace(/\}\s*\"/g, '},"')
	);
}

/**
 * @param {string} content
 */
function formatJson(content) {
	const valueAsJson = JSON.parse('{' + content + '}');
	return JSON.stringify(valueAsJson, null, 2);
}

const content = readFile();
const parsedFile = parseFileToJson(content);
fs.writeFileSync('parsed.json', formatJson(parsedFile), { flag: 'w+' });
console.log('File write complete.');
