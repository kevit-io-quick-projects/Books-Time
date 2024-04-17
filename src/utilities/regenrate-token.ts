import { axiosHelper } from '../helpers/axios.helper';

export const regenAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const { CLIENT_SECRET, CLIENT_ID, OAUTH_URL } = process.env;
    const url = `${OAUTH_URL}?refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token`;
    const { data } = await axiosHelper('post', url, null, null);
    return data.access_token;
  } catch (error) {
    console.log(`Error while regenerating access token!`);
    throw error;
  }
};
