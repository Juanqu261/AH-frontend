const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

const apiUrl = process.env.API_URL || 'https://YOUR_BACKEND_DOMAIN.com/api';

const base64Url = Buffer.from(apiUrl).toString('base64');

const envConfigFile = `export const environment = {
    production: true,
    apiUrl: atob('${base64Url}'),
    shopifyBaseUrl: 'https://adagiozandharmonie.myshopify.com/products/'
};
`;


fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.prod.ts file generated correctly at ${targetPath} \n`);
    }
});
