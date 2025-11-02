export interface ChangeMasterPasswordResponse {
  userId: string;
  passwordEntriesReEncrypted: number;
  changedAt: Date;
}
