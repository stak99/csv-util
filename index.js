const csv = require('csv-parser');
const fs = require('fs');
const resolve = require('path').resolve
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const dir = resolve(__dirname, 'files-todo');
const outDir = resolve(__dirname, 'files-output');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

const months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
}
const escapes = [
    'SCREWFIX DIRECT EDINBURGH,SIG'
];


fs.readdir('./files-todo', (err, files) => {

    files.forEach(file => {
        const filePath = resolve(dir, file);
        const result = [];

        // Validate CSV

        let contents = fs.readFileSync(filePath).toString();

        // Escape the escapes list
        escapes.map(escape => {
            contents = contents.replace(escape, escape.replace(',', ' '));
        });


        // No more than 5 comas per line

        contents.split('\n').map(line => {
            if (line && (line.match(/,/g) || []).length !== 5) {
                console.error("Issue with numnber of commas in the line, Please fix before continuing", line);
                console.error('The file name', filePath);
                process.exit(1);
            }
        });

        // Update the escaped contents to source files
        fs.writeFileSync(filePath, contents);


        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                delete row.Type;
                delete row.Balance;
                console.log(row);
                if (row.Date) {
                    var date = row.Date.split(" ");
                    var newDate = date[0] + '/' + months[date[1]] + '/' + date[2];

                    row.Date = newDate;

                    result.push(row);
                    console.log(row);
                }
                else {
                    console.error("Row undefined", row);
                }
            })
            .on('end', () => {
                console.log(`CSV file ${file} successfully processed`);

                const outFilePath = resolve(outDir, file);
                const csvWriter = createCsvWriter({
                    path: outFilePath,
                    header: [
                        { id: 'Date', title: 'Date' },
                        { id: 'Description', title: 'Description' },
                        { id: 'Paid Out', title: 'Paid Out' },
                        { id: 'Paid In', title: 'Paid In' },
                    ]
                });

                csvWriter
                    .writeRecords(result)
                    .then(() => console.log(`The CSV file ${outFilePath} was written successfully`));
            });

    });
});


