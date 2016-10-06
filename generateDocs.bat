@ECHO OFF
ECHO This program asuumes that you have installed jsdoc previously with: "npm install -g jsdoc"
ECHO Generating docs with JSDocs in path "./public/docs/" and using config file ./jsdoc_config.json with template "./node_modules/ink-docstrap/template"
jsdoc -r  -c ./jsdoc_config.json -t ./node_modules/ink-docstrap/template -d ./public/docs/ -p ./package.json .
ECHO Generation completed
exit
