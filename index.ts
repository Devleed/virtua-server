import express, { Express } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { writeFile } from 'fs';
import TOKENS from './data.json';
const cors = require('cors');

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());

type CoinInfo = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

async function githubTokens() {
  const url = `https://api.github.com/repos/Uniswap/extended-token-list/contents/src/tokens/mainnet.json`;

  const { data }: { data: { download_url: string } } = await axios.get(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (data && data.download_url) {
    const { data: tokens }: { data: CoinInfo[] } = await axios.get(
      data.download_url,
    );

    if (tokens && tokens.length) {
      const convertedObject = tokens.reduce((result, item) => {
        result[item.address.toLowerCase()] = item;
        return result;
      }, {} as Record<string, any>);

      writeFile('data.json', JSON.stringify(convertedObject), err => {
        if (err) {
          console.error('Error writing JSON file:', err);
        } else {
          console.log('JSON file saved successfully');
        }
      });
    }
  }
}

app.get('/', async (req, res) => {
  await githubTokens();
  res.send('RONIN POWERBACNK');
});

app.get('/tokens', async (req, res) => {
  // const page = req.query?.page || '1';

  // Convert the structure into an array of key-value pairs
  // const coinsArray: [string, CoinInfo][] = Object.entries(TOKENS);

  // Slice the first 10 items
  // const first10Items: [string, CoinInfo][] = coinsArray.slice(
  //   0,
  //   parseInt(page as string) * 10,
  // );

  // // If you want to convert it back to an object
  // const result: Record<string, CoinInfo> = first10Items.reduce(
  //   (acc, [key, value]) => {
  //     acc[value.address] = value;
  //     return acc;
  //   },
  //   {} as Record<string, any>,
  // );

  // Define the pagination parameters

  const page = req.query?.page ? parseInt(req.query.page as string) : 1; // Get the requested page, default to 1 if not provided
  const limit = req.query?.limit ? parseInt(req.query.limit as string) : 10; // Number of items per page, default to 10 if not provided

  // Calculate the start and end indexes for the current page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  //All Tokens from the database - json
  const allTokens: [string, CoinInfo][] = Object.entries(TOKENS);


  // Slice the array to get the tokens for the current page
  const tokensOnPage = allTokens.slice(startIndex, endIndex);

  // Check if there are more pages
  const hasMore = endIndex < allTokens.length;




  res.send({
    tokens: tokensOnPage,
    currentPage: page,
    limit: limit,
    totalPages: Math.ceil(allTokens.length / limit),
    totalTokens: allTokens.length,
    hasMore: hasMore
  });
});

app.get('/tokens/search', async (req, res) => {
  const query = req.query?.query;

  res.send(
    Object.values(TOKENS).filter(
      token =>
        token.name.includes(query as string) ||
        token.symbol.includes(query as string),
    ),
  );
});

app.get('/tokens/:address', async (req, res) => {
  const address = req.params.address;

  res.send(TOKENS[address.trim().toLowerCase() as keyof typeof TOKENS]);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
