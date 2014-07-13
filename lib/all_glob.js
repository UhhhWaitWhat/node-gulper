var path = require('path');
var fs = require('fs');

//Prepare our globbing expression
module.exports = function() {
	var gitignore;

	//Read in our gitignore
	try {
		gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), {encoding: 'utf8'});
	} catch(e) {
		gitignore = '';
	}

	//Split gitignore file linewise
	//Filter empty lines
	//Prepend with '!' for our globbing
	var all = ['**/*'];

	gitignore.split('\n')
		.filter(function(el) {return el.length>0})
		.forEach(function(el) {
			all.push('!'+el);
			all.push('!'+el+'/**/*');
		});

	return all;
};
