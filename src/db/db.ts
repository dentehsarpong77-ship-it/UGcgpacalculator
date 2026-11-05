import Dexie, { type Table } from 'dexie';
import type { Semester, AppSettings } from '../types/index';

export class Database extends Dexie {
  semesters!: Table<Semester>;
  settings!: Table<AppSettings>;

  constructor() {
    super('UGGPAPlannerDB');
    this.version(1).stores({
      semesters: 'id, studentEmail, level',
      settings: 'id, studentEmail' // Settings will be stored with a fixed ID 'main' + studentEmail
    });
  }
}

export const db = new Database();
