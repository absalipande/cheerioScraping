import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const jsonFilePath = join(process.cwd(), '/articles.json');
const url = 'https://www.nytimes.com/topic/subject/veganism';

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data from ${url}: ${error.message}`);
  }
};

const extractArticles = (html) => {
  const $ = cheerio.load(html);
  const articles = [];

  $('.css-18yolpw').each(function () {
    const title = $(this).find('h3').text();
    const description = $(this).find('p').text();
    const image = $(this).find('img').attr('src');
    const author = $(this).find('.css-1n7hynb').text();
    const relativeUrl = $(this).find('a').attr('href');
    const articleUrl = `https://www.nytimes.com${relativeUrl}`;
    const date = relativeUrl.substring(1, 11);

    articles.push({ title, description, image, author, relativeUrl, articleUrl, date });
  });

  return articles;
};

const writeToFile = async (articles) => {
  try {
    const articleAsString = JSON.stringify(articles, null, 2);
    await writeFile(jsonFilePath, articleAsString);
    console.log(`Date written to ${jsonFilePath}`);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }
};

const getArticles = async () => {
  try {
    const html = await fetchData(url);
    const articles = extractArticles(html);
    await writeToFile(articles);
  } catch (error) {
    console.error(error.message);
  }
};

getArticles();
