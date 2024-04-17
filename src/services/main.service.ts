import { readFileSync, writeFileSync } from 'fs';
import { axiosHelper } from '../helpers/axios.helper';

const { OAUTH_URL, REDIRECT_URL } = process.env;

export const activateMain = async (code: string) => {
  try {
    console.log(`Activating main...`);
    const { accessToken, refreshToken } = await genTokens(code);
    console.log(`Saving tokens in a file...`);
    writeFileSync(`${__dirname}/../tokens.json`, JSON.stringify({ accessToken, refreshToken }), 'utf8');
    console.log(`Tokens saved!`);
  } catch (error) {
    console.log(`Error in the main Service!`);
    throw error;
  }
};

const genTokens = async (code: string): Promise<{ accessToken: string; refreshToken: string }> => {
  console.log(`Generating Tokens...`);
  try {
    const client = readFileSync(`${__dirname}/../client.json`, 'utf8');
    const { clientId, clientSecret } = JSON.parse(client);
    const url = `${OAUTH_URL}?code=${code}&redirect_uri=${REDIRECT_URL}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&prompt=consent&access_type=offline`;
    const { data } = await axiosHelper('post', url, null, null);
    const { access_token: accessToken, refresh_token: refreshToken } = data;
    console.log(`Tokens generated!`);
    return { accessToken, refreshToken };
  } catch (error) {
    console.log('Error while generating Tokens!');
    throw error;
  }
};
