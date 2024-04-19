export interface ObjectType {
  [key: string]: any;
}
export interface Logs {
  prevMonth: MonthlyLogs;
  currentMonth: MonthlyLogs;
}

export interface MonthlyLogs {
  nonBillable: number;
  billable: number;
  total: number;
}
