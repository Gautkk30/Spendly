import { db } from './db';

export interface AppSettingsDocument {
  _id: string; // MongoDB Document ID
  applicationName: string;
  logoUrl: string;
  faviconUrl: string;
  tagline?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  updatedAt: string;
  updatedBy: string;
}

class AppSettingsModel {
  public async findOne(): Promise<AppSettingsDocument | null> {
    const data = db.get();
    if (!data.appSettings) {
      // Default singleton document
      data.appSettings = {
        _id: '64b1f893f0b2a5c1a8d01234', // MongoDB 24-char ObjectId
        applicationName: data.appConfig?.appName || 'Spendly',
        logoUrl: data.appConfig?.appLogo || '',
        faviconUrl: data.appConfig?.appLogo || '', // Fallback to logo by default
        tagline: 'Smarter Wealth & Ledger Auditing Suite',
        brandColors: {
          primary: '#09090b',
          secondary: '#27272a'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      };
      db.save();
    }
    return data.appSettings;
  }

  public async updateOne(
    filter: any,
    update: { $set: Partial<AppSettingsDocument> },
    options?: { upsert?: boolean }
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const data = db.get();
    const current = await this.findOne();
    
    const setObj = update.$set || {};
    const updated: AppSettingsDocument = {
      _id: current?._id || '64b1f893f0b2a5c1a8d01234',
      applicationName: setObj.applicationName !== undefined ? setObj.applicationName : (current?.applicationName || 'Spendly'),
      logoUrl: setObj.logoUrl !== undefined ? setObj.logoUrl : (current?.logoUrl || ''),
      faviconUrl: setObj.faviconUrl !== undefined ? setObj.faviconUrl : (current?.faviconUrl || ''),
      tagline: setObj.tagline !== undefined ? setObj.tagline : (current?.tagline || 'Smarter Wealth & Ledger Auditing Suite'),
      brandColors: setObj.brandColors !== undefined ? setObj.brandColors : (current?.brandColors || { primary: '#09090b', secondary: '#27272a' }),
      updatedAt: new Date().toISOString(),
      updatedBy: setObj.updatedBy || 'admin'
    };

    data.appSettings = updated;
    
    // Maintain old config sync for backward compatibility
    data.appConfig = {
      appName: updated.applicationName,
      appLogo: updated.logoUrl
    };

    db.save();
    return { acknowledged: true, modifiedCount: 1 };
  }
}

export const AppSettings = new AppSettingsModel();
