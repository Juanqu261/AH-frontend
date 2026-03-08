const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

let apiUrl = 'https://YOUR_BACKEND_DOMAIN.com/api';

if (process.env.API_URL) {
    // Decode the Base64 string from Netlify back to a normal text URL during the build
    apiUrl = Buffer.from(process.env.API_URL, 'base64').toString('utf-8');
}

const envConfigFile = `export const environment = {
    production: true,
    apiUrl: '${apiUrl}',
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
