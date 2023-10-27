import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const jsonFilePath = join(process.cwd(), '/articlesTwo.json');
const url = 'https://www.scrapethissite.com/pages/';

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data from ${url}: ${error.message}`);
  }
};

const extractArticlesTwo = (html) => {
  const $ = cheerio.load(html);
  const articlesTwo = [];

  $('.page').each(function () {
    const title = $(this).find('.page-title a').text();
    const description = $(this).find('.lead.session-desc').text().trim().replace(/\n/g, '');
    const relativeUrl = $(this).find('.page-title a').attr('href');
    const articleUrl = `https://www.scrapethissite.com${relativeUrl}`;

    articlesTwo.push({ title, description, relativeUrl, articleUrl });
  });

  return articlesTwo;
};

const writeToFile = async (articlesTwo) => {
  try {
    const articlesTwoAsString = JSON.stringify(articlesTwo, null, 2);
    await writeFile(jsonFilePath, articlesTwoAsString);
    console.log(`Data written to ${jsonFilePath}`);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }
};

const getArticlesTwo = async () => {
  try {
    const html = await fetchData(url);
    const articlesTwo = extractArticlesTwo(html);
    await writeToFile(articlesTwo);
  } catch (error) {
    console.error(error.message);
  }
};

getArticlesTwo();
