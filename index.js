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

fs.readdir('./files-todo', (err, files) => {

    files.forEach(file => {
        const filePath = resolve(dir, file);
        const result = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                delete row.Type;
                delete row.Balance;

                var date = row.Date.split(" ");
                var newDate = date[0] + '/' + months[date[1]] + '/' + date[2];

                row.Date = newDate;

                result.push(row);
                console.log(row);
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


