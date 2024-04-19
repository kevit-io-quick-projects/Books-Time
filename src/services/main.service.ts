import { readFileSync } from 'fs';
import { axiosHelper } from '../helpers/axios.helper';
import { regenAccessToken } from '../utilities/regenerate-token';
import { MonthlyLogs } from '../interfaces/common';
import { getCurrentDate, hoursToMinutes } from '../utilities/date-time';

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
    for (const portal in projects) {
      if (projects[portal]) {
        for (const project of projects[portal]) {
          console.log(`Fetching logs of all users for ${project} project...`);
          const currentDate = getCurrentDate();
          const prevDate = getCurrentDate('prev');
          const promises = [currentDate, prevDate].map((date) => getLogs(portal, project, 'all', date, accessToken));
          const [current, previous] = await Promise.all(promises);
          if (current.total > previous.total + 0.15 * previous.total)
            console.log(`Total hours for project ${project} is more than 15% of previous month!`);
        }
      }
    }
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
const getProjects = async (portals: number[], accessToken: string): Promise<{ [key: string]: string[] }> => {
  console.log(`Fetching Projects...`);
  try {
    const promises = portals.map((portal) => getProjectsByPortal(portal, accessToken));
    const projectsData = await Promise.all(promises);
    const projects = {};
    projectsData.forEach((project) => {
      Object.assign(projects, project);
    });
    console.log(`Projects Fetched!`);
    return projects;
  } catch (error) {
    console.log(`Error while fetching Projects!`);
    throw error;
  }
};
const getProjectsByPortal = async (portal: number, accessToken: string): Promise<{ [key: string]: string[] }> => {
  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const { data } = await axiosHelper('get', `${ZOHO_PROJECTS_API}/portal/${portal}/projects/`, null, headers);
    const projects = data?.projects?.map((p) => p.id_string);
    return { [portal]: projects };
  } catch (error) {
    console.log(`Error while fetching Projects for ${portal}!`);
    throw error;
  }
};

const getLogs = async (
  portal: string,
  project: string,
  users: string[] | string,
  date: string,
  accessToken: string
): Promise<MonthlyLogs> => {
  try {
    const usersList = Array.isArray(users) ? users.join(',') : users;
    const url = `${ZOHO_PROJECTS_API}/portal/${portal}/projects/${project}/logs/?view_type=month&bill_status=All&component_type=task&date=${date}&users_list=${usersList}`;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const { data } = await axiosHelper('get', url, null, headers);
    if (!data) return;
    const { billable_hours, non_billable_hours, grandtotal } = data.timelogs;
    return {
      billable: hoursToMinutes(billable_hours),
      nonBillable: hoursToMinutes(non_billable_hours),
      total: hoursToMinutes(grandtotal)
    };
  } catch (error) {
    console.log(`Error while fetching logs for ${project} project!`);
    throw error;
  }
};
