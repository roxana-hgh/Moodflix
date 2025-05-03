const fs = require('fs');
require('dotenv').config();

// Define the environment file paths
const envProdTemplatePath = './src/environments/environment.prod.template.ts';
const envTemplatePath = './src/environments/environment.template.ts';
const targetProdPath = './src/environments/environment.prod.ts';
const targetPath = './src/environments/environment.ts';

// Get environment variables

const tmdbToken = process.env.TMDB_TOKEN || '';

// Read template files
let envProdTemplate = fs.readFileSync(envProdTemplatePath, 'utf8');
let envTemplate = fs.readFileSync(envTemplatePath, 'utf8');

// Replace placeholders with actual values
envProdTemplate = envProdTemplate
  .replace('TMDB_TOKEN_PLACEHOLDER', tmdbToken);

envTemplate = envTemplate
  .replace('TMDB_TOKEN_PLACEHOLDER', tmdbToken);

// Write the files
fs.writeFileSync(targetProdPath, envProdTemplate);
console.log(`Environment file ${targetProdPath} generated`);

fs.writeFileSync(targetPath, envTemplate);
console.log(`Environment file ${targetPath} generated`);