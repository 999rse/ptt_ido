const fs = require('fs');
const path = require('path');

const inputFilePath = 'build/contracts/IDOToken.json';
const outputFolderPath = 'abi';
const outputFileName = 'abi_ido_token.json';

// проверка существования папки `abi` и создание ее, если она не существует
if (!fs.existsSync(outputFolderPath)) {
  fs.mkdirSync(outputFolderPath);
}

// чтение json файла
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Ошибка при чтении файла: ' + err);
    return;
  }

  // разбор json
  try {
    const jsonData = JSON.parse(data);

    // получение конкретного поля
    const desiredField = jsonData.abi;

    // запись значения поля в файл в папке `abi`
    fs.writeFile(path.join(outputFolderPath, outputFileName), JSON.stringify(desiredField, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Ошибка при записи файла: ' + writeErr);
      } else {
        console.log('Значение поля записано в файл ' + outputFileName);
      }
    });
  } catch (parseError) {
    console.error('Ошибка при разборе JSON: ' + parseError);
  }
});
