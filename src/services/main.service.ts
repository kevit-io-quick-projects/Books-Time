import { readFileSync } from 'fs';
import { axiosHelper } from '../helpers/axios.helper';
import { regenAccessToken } from '../utilities/regenerate-token';

const { OAUTH_URL, REDIRECT_URL, ZOHO_PROJECTS_API } = process.env;

export const activateMain = async () => {
  try {
    const client = readFileSync(`${__dirname}/../client.json`, 'utf8');
    const { clientId, clientSecret } = JSON.parse(client);
    const tokens = readFileSync(`${__dirname}/../tokens.json`, 'utf8');
    const { refreshToken } = JSON.parse(tokens);
    const accessToken = await regenAccessToken(OAUTH_URL, refreshToken, clientId, clientSecret);
    const portals = await getPortals(accessToken);
    const projects = await getProjects(portals, accessToken);
    console.log(projects);
  } catch (error) {
    console.log(`Error in the main Service!`);
    throw error;
  }
};

export const genTokens = async (code: string): Promise<{ accessToken: string; refreshToken: string }> => {
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

const getPortals = async (accessToken: string): Promise<number[]> => {
  console.log(`Fetching Portals...`);
  try {
    const url = `${ZOHO_PROJECTS_API}/portals/`;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const { data } = await axiosHelper('get', url, null, headers);
    const portals = data.portals.map((portal) => portal.id);
    console.log(`Portals Fetched!`);
    return portals;
  } catch (error) {
    console.log(`Error while fetching Portals!`);
    throw error;
  }
};
const getProjects = async (portals: number[], accessToken: string): Promise<string[]> => {
  console.log(`Fetching Projects...`);
  try {
    console.log(portals);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const promises = portals.map((portal) =>
      axiosHelper('get', `${ZOHO_PROJECTS_API}/portal/${portal}/projects/`, null, headers)
    );
    const projectsData = await Promise.all(promises);
    const projects = projectsData.map((project) => project.data.projects.map((p) => p.id_string));
    console.log(`Projects Fetched!`);
    return projects.flat();
  } catch (error) {
    console.log(`Error while fetching Projects!`);
    throw error;
  }
};
