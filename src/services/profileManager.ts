// ROUTINE FEATURE START
// Profile management service for multi-profile support

import { Profile } from '../types/routineFeatures';
import { Transaction, Category } from '../types';
import { 
  saveProfiles, 
  getProfiles, 
  saveActiveProfile, 
  getActiveProfile 
} from '../utils/routineStorage';
import { 
  saveTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction,
  saveCategories,
  getCategories
} from '../utils/storage';

export class ProfileManager {
  private static instance: ProfileManager;
  private currentProfileId: string = 'personal';

  private constructor() {}

  static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  // Initialize profiles
  async initializeProfiles(): Promise<void> {
    try {
      const existingProfiles = await getProfiles();
      if (existingProfiles.length === 0) {
        const defaultProfiles = this.getDefaultProfiles();
        await saveProfiles(defaultProfiles);
      }
      
      // Load active profile
      this.currentProfileId = await getActiveProfile();
    } catch (error) {
      console.error('Error initializing profiles:', error);
    }
  }

  // Get default profiles
  private getDefaultProfiles(): Profile[] {
    return [
      {
        id: 'personal',
        name: 'Personal',
        type: 'personal',
        color: '#007AFF',
        icon: 'person',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'business',
        name: 'Business',
        type: 'business',
        color: '#34C759',
        icon: 'briefcase',
        isActive: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'shared',
        name: 'Shared Wallet',
        type: 'shared',
        color: '#FF9500',
        icon: 'people',
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Get all profiles
  async getProfiles(): Promise<Profile[]> {
    return await getProfiles();
  }

  // Get current active profile
  async getCurrentProfile(): Promise<Profile | null> {
    const profiles = await getProfiles();
    return profiles.find(p => p.id === this.currentProfileId) || null;
  }

  // Switch to a different profile
  async switchProfile(profileId: string): Promise<boolean> {
    try {
      const profiles = await getProfiles();
      const targetProfile = profiles.find(p => p.id === profileId);
      
      if (!targetProfile) {
        return false;
      }

      // Update active status
      const updatedProfiles = profiles.map(p => ({
        ...p,
        isActive: p.id === profileId,
      }));

      await saveProfiles(updatedProfiles);
      await saveActiveProfile(profileId);
      this.currentProfileId = profileId;

      return true;
    } catch (error) {
      console.error('Error switching profile:', error);
      return false;
    }
  }

  // Create a new profile
  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt'>): Promise<Profile> {
    try {
      const profiles = await getProfiles();
      const newProfile: Profile = {
        ...profileData,
        id: `profile_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      profiles.push(newProfile);
      await saveProfiles(profiles);

      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<boolean> {
    try {
      const profiles = await getProfiles();
      const profileIndex = profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex === -1) {
        return false;
      }

      profiles[profileIndex] = { ...profiles[profileIndex], ...updates };
      await saveProfiles(profiles);

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Delete profile
  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      const profiles = await getProfiles();
      
      // Don't allow deleting the last profile
      if (profiles.length <= 1) {
        return false;
      }

      // Don't allow deleting the active profile
      if (profileId === this.currentProfileId) {
        return false;
      }

      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      await saveProfiles(updatedProfiles);

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  // Get profile-specific storage key
  private getProfileKey(baseKey: string): string {
    return `${baseKey}_${this.currentProfileId}`;
  }

  // Profile-specific transaction methods
  async getProfileTransactions(): Promise<Transaction[]> {
    try {
      // In a real implementation, you'd store transactions per profile
      // For now, we'll filter by a profile identifier in the transaction
      const allTransactions = await getTransactions();
      return allTransactions.filter(t => 
        (t as any).profileId === this.currentProfileId || 
        !(t as any).profileId // Legacy transactions belong to personal profile
      );
    } catch (error) {
      console.error('Error getting profile transactions:', error);
      return [];
    }
  }

  async saveProfileTransaction(transaction: Transaction): Promise<void> {
    try {
      // Add profile identifier to transaction
      const profileTransaction = {
        ...transaction,
        profileId: this.currentProfileId,
      };
      await saveTransaction(profileTransaction);
    } catch (error) {
      console.error('Error saving profile transaction:', error);
      throw error;
    }
  }

  async updateProfileTransaction(transaction: Transaction): Promise<void> {
    try {
      const profileTransaction = {
        ...transaction,
        profileId: this.currentProfileId,
      };
      await updateTransaction(profileTransaction);
    } catch (error) {
      console.error('Error updating profile transaction:', error);
      throw error;
    }
  }

  async deleteProfileTransaction(transactionId: string): Promise<void> {
    try {
      await deleteTransaction(transactionId);
    } catch (error) {
      console.error('Error deleting profile transaction:', error);
      throw error;
    }
  }

  // Profile-specific categories
  async getProfileCategories(): Promise<Category[]> {
    try {
      const allCategories = await getCategories();
      // For now, all profiles share categories
      // In a real implementation, you might want separate categories per profile
      return allCategories;
    } catch (error) {
      console.error('Error getting profile categories:', error);
      return [];
    }
  }

  async saveProfileCategories(categories: Category[]): Promise<void> {
    try {
      await saveCategories(categories);
    } catch (error) {
      console.error('Error saving profile categories:', error);
      throw error;
    }
  }

  // Get profile statistics
  async getProfileStats(): Promise<{
    totalTransactions: number;
    totalSpent: number;
    averageTransaction: number;
    mostUsedCategory: string;
  }> {
    try {
      const transactions = await this.getProfileTransactions();
      
      if (transactions.length === 0) {
        return {
          totalTransactions: 0,
          totalSpent: 0,
          averageTransaction: 0,
          mostUsedCategory: 'None',
        };
      }

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageTransaction = totalSpent / transactions.length;

      // Find most used category
      const categoryCount = new Map<string, number>();
      transactions.forEach(t => {
        const count = categoryCount.get(t.category) || 0;
        categoryCount.set(t.category, count + 1);
      });

      const mostUsedCategory = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      return {
        totalTransactions: transactions.length,
        totalSpent,
        averageTransaction,
        mostUsedCategory,
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      return {
        totalTransactions: 0,
        totalSpent: 0,
        averageTransaction: 0,
        mostUsedCategory: 'None',
      };
    }
  }

  // Get profile type display name
  getProfileTypeDisplayName(type: Profile['type']): string {
    switch (type) {
      case 'personal':
        return 'Personal';
      case 'business':
        return 'Business';
      case 'shared':
        return 'Shared Wallet';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  }

  // Get profile icon
  getProfileIcon(type: Profile['type']): string {
    switch (type) {
      case 'personal':
        return 'person';
      case 'business':
        return 'briefcase';
      case 'shared':
        return 'people';
      case 'custom':
        return 'star';
      default:
        return 'person';
    }
  }

  // Get profile color
  getProfileColor(type: Profile['type']): string {
    switch (type) {
      case 'personal':
        return '#007AFF';
      case 'business':
        return '#34C759';
      case 'shared':
        return '#FF9500';
      case 'custom':
        return '#AF52DE';
      default:
        return '#007AFF';
    }
  }

  // Check if profile is active
  async isProfileActive(profileId: string): Promise<boolean> {
    return this.currentProfileId === profileId;
  }

  // Get current profile ID
  getCurrentProfileId(): string {
    return this.currentProfileId;
  }
}

// Export singleton instance
export const profileManager = ProfileManager.getInstance();

// ROUTINE FEATURE END 