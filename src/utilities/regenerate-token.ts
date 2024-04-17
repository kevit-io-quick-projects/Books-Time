import { writeFileSync } from 'fs';
import { axiosHelper } from '../helpers/axios.helper';

export const regenAccessToken = async (
  authUrl: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  console.log(`Regenerating access token...`);
  try {
    const url = `${authUrl}?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
    const { data } = await axiosHelper('post', url, null, null);
    const { access_token: accessToken } = data;
    writeFileSync(`${__dirname}/../tokens.json`, JSON.stringify({ accessToken, refreshToken }), 'utf8');
    console.log(`Access token Regenerated!`);
    return accessToken;
  } catch (error) {
    console.log(`Error while regenerating access token!`);
    throw error;
  }
};
