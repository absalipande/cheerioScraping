import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const jsonFilePath = join(process.cwd(), '/quotes.json');
const url = 'https://quotes.toscrape.com/';

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data from ${url}: ${error.message}`);
  }
};

const extractQuotes = (html) => {
  const $ = cheerio.load(html);
  const quotes = [];

  $('.col-md-8 .quote').each(function () {
    const title = $(this).find('.text').text();
    const author = $(this).find('.author').text();
    const linkAbout = $(this).find('a').attr('href');

    const tags = [];
    $(this)
      .find('.tags a.tag')
      .each(function () {
        tags.push($(this).text());
      });
    console.log([title, author, linkAbout, tags]);
  });

  return quotes;
};

const writeToFile = async (quotes) => {
  try {
    const quotesAsString = JSON.stringify(quotes, null, 2);
    await writeFile(jsonFilePath, quotesAsString);
    console.log(`Data written to ${jsonFilePath}`);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }
};

const getQuotes = async () => {
  try {
    const html = await fetchData(url);
    const quotes = extractQuotes(html);
    await writeToFile(quotes);
  } catch (error) {
    console.error(error.message);
  }
};

getQuotes();
