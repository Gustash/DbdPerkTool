const fs = require('fs');

const patrons = JSON.parse(fs.readFileSync('C:\\Users\\nrcra\\Downloads\\patrons.json'));

console.log()

const filtered = patrons.included.map(d => {
    return {name: d.attributes.full_name};
}).filter(name => name !== undefined);

fs.writeFileSync('C:\\Users\\nrcra\\Downloads\\aaaa.json', JSON.stringify(filtered));