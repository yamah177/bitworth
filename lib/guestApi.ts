import {
  localGetAccounts, localAddAccount, localUpdateAccount, localDeleteAccount,
  localGetLiabilities, localAddLiability, localUpdateLiability, localDeleteLiability,
  localGetSnapshots, localAddSnapshot,
  localGetPref, localSetPref,
} from './localdb'

export const guestApi = {
  async getAccounts() { return localGetAccounts() },
  async createAccount(data: any) { return localAddAccount(data) },
  async updateAccount(id: string, data: any) { return localUpdateAccount(id, data) },
  async deleteAccount(id: string) { return localDeleteAccount(id) },
  async getLiabilities() { return localGetLiabilities() },
  async createLiability(data: any) { return localAddLiability(data) },
  async updateLiability(id: string, data: any) { return localUpdateLiability(id, data) },
  async deleteLiability(id: string) { return localDeleteLiability(id) },
  async getSnapshots(days = 365) { return localGetSnapshots(days) },
  async createSnapshot(data: any) { return localAddSnapshot(data) },
  async getCurrency(): Promise<string> { return (await localGetPref('currency')) ?? 'usd' },
  async setCurrency(code: string) { return localSetPref('currency', code) },
}
