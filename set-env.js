const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

// We provide a fallback just in case it is run without the variable explicitly set
const apiUrl = process.env.API_URL || 'https://YOUR_BACKEND_DOMAIN.com/api';

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
