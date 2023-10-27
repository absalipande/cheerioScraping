import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const jsonFilePath = join(process.cwd(), '/books.json');
const url = 'https://books.toscrape.com/catalogue/page-1.html';

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetcing data from ${url}: ${error.message}`);
  }
};

const extractBooks = (html) => {
  const $ = cheerio.load(html);
  const books = [];

  $('.product_pod').each(function () {
    const img = $(this).find('img').attr('src');
    const title = $(this).find('h3').text();
    const price = $(this).find('.price_color').text();
    const availability = $(this).find('.instock.availability').length > 0 ? 'In stock' : 'Out of stock';

    const ratingMap = {
      Zero: 0,
      One: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
    };

    let ratings;
    $(this)
      .find('.star-rating')
      .each(function () {
        const className = $(this).attr('class');
        const ratingWord = className.split(' ')[1];
        ratings = ratingMap[ratingWord];
      });

    books.push({ img, title, price, availability, ratings });
  });

  return books;
};

const writeToFile = async (books) => {
  try {
    const booksAsString = JSON.stringify(books, null, 2);
    await writeFile(jsonFilePath, booksAsString);
    console.log(`Data written to ${jsonFilePath}`);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }
};

const getBooks = async () => {
  try {
    const html = await fetchData(url);
    const books = extractBooks(html);
    await writeToFile(books);
  } catch (error) {
    console.error(error.message);
  }
};

getBooks();
