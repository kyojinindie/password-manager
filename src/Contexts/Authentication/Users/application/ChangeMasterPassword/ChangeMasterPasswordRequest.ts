export interface ChangeMasterPasswordRequest {
  userId: string;
  currentMasterPassword: string;
  newMasterPassword: string;
}
