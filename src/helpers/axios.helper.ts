import axios from 'axios';
import { ObjectType } from 'src/interfaces/common';

export const axiosHelper = (method: string, url: string, data: ObjectType, headers: ObjectType) => {
  return axios({ method, url, data, headers });
};
