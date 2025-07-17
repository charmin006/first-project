// ROUTINE FEATURE START
// Component for managing multiple user profiles

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../../types/routineFeatures';
import { profileManager } from '../../services/profileManager';

interface ProfileManagerProps {
  onClose: () => void;
  onProfileSwitch: (profileId: string) => void;
}

export const ProfileManagerComponent: React.FC<ProfileManagerProps> = ({ 
  onClose, 
  onProfileSwitch 
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    type: 'custom' as Profile['type'],
    color: '#007AFF',
  });
  const [profileStats, setProfileStats] = useState({
    totalTransactions: 0,
    totalSpent: 0,
    averageTransaction: 0,
    mostUsedCategory: 'None',
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const allProfiles = await profileManager.getProfiles();
      const current = await profileManager.getCurrentProfile();
      
      setProfiles(allProfiles);
      setCurrentProfile(current);
      
      if (current) {
        const stats = await profileManager.getProfileStats();
        setProfileStats(stats);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    try {
      const success = await profileManager.switchProfile(profileId);
      if (success) {
        await loadProfiles();
        onProfileSwitch(profileId);
        Alert.alert('Success', 'Profile switched successfully!');
      }
    } catch (error) {
      console.error('Error switching profile:', error);
      Alert.alert('Error', 'Failed to switch profile.');
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileData.name.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    try {
      const newProfile = await profileManager.createProfile({
        name: newProfileData.name,
        type: newProfileData.type,
        color: newProfileData.color,
        icon: profileManager.getProfileIcon(newProfileData.type),
        isActive: false,
      });
      
      setProfiles(prev => [...prev, newProfile]);
      setShowCreateModal(false);
      setNewProfileData({ name: '', type: 'custom', color: '#007AFF' });
      
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile.');
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !newProfileData.name.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    try {
      const success = await profileManager.updateProfile(editingProfile.id, {
        name: newProfileData.name,
        type: newProfileData.type,
        color: newProfileData.color,
        icon: profileManager.getProfileIcon(newProfileData.type),
      });
      
      if (success) {
        await loadProfiles();
        setShowEditModal(false);
        setEditingProfile(null);
        setNewProfileData({ name: '', type: 'custom', color: '#007AFF' });
        
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleDeleteProfile = async (profile: Profile) => {
    if (profile.isActive) {
      Alert.alert('Error', 'Cannot delete the active profile. Please switch to another profile first.');
      return;
    }

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await profileManager.deleteProfile(profile.id);
              if (success) {
                await loadProfiles();
                Alert.alert('Success', 'Profile deleted successfully!');
              }
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setNewProfileData({
      name: profile.name,
      type: profile.type,
      color: profile.color,
    });
    setShowEditModal(true);
  };

  const getProfileTypeOptions = () => [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
    { value: 'shared', label: 'Shared Wallet' },
    { value: 'custom', label: 'Custom' },
  ];

  const getColorOptions = () => [
    '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5856D6', '#FF2D92', '#5AC8FA'
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Manager</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {currentProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Profile</Text>
          
          <View style={styles.currentProfileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileIcon, { backgroundColor: currentProfile.color }]}>
                <Ionicons name={currentProfile.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentProfile.name}</Text>
                <Text style={styles.profileType}>
                  {profileManager.getProfileTypeDisplayName(currentProfile.type)}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileStats.totalTransactions}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${profileStats.totalSpent.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${profileStats.averageTransaction.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileStats.mostUsedCategory}</Text>
                <Text style={styles.statLabel}>Top Category</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Profiles</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Profile</Text>
          </TouchableOpacity>
        </View>
        
        {profiles.map((profile) => (
          <View key={profile.id} style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileIcon, { backgroundColor: profile.color }]}>
                <Ionicons name={profile.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileType}>
                  {profileManager.getProfileTypeDisplayName(profile.type)}
                </Text>
              </View>
              
              {profile.isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>

            <View style={styles.profileActions}>
              {!profile.isActive && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSwitchProfile(profile.id)}
                >
                  <Ionicons name="swap-horizontal" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Switch</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(profile)}
              >
                <Ionicons name="create" size={16} color="#007AFF" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              {!profile.isActive && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProfile(profile)}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Create Profile Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Name</Text>
              <TextInput
                style={styles.textInput}
                value={newProfileData.name}
                onChangeText={(text) => setNewProfileData({ ...newProfileData, name: text })}
                placeholder="Enter profile name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Type</Text>
              <View style={styles.typeSelector}>
                {getProfileTypeOptions().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeOption,
                      newProfileData.type === option.value && styles.typeOptionActive,
                    ]}
                    onPress={() => setNewProfileData({ ...newProfileData, type: option.value as Profile['type'] })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        newProfileData.type === option.value && styles.typeOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Color</Text>
              <View style={styles.colorSelector}>
                {getColorOptions().map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newProfileData.color === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setNewProfileData({ ...newProfileData, color })}
                  >
                    {newProfileData.color === color && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateProfile}
              >
                <Text style={styles.primaryButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Name</Text>
              <TextInput
                style={styles.textInput}
                value={newProfileData.name}
                onChangeText={(text) => setNewProfileData({ ...newProfileData, name: text })}
                placeholder="Enter profile name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Type</Text>
              <View style={styles.typeSelector}>
                {getProfileTypeOptions().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeOption,
                      newProfileData.type === option.value && styles.typeOptionActive,
                    ]}
                    onPress={() => setNewProfileData({ ...newProfileData, type: option.value as Profile['type'] })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        newProfileData.type === option.value && styles.typeOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Color</Text>
              <View style={styles.colorSelector}>
                {getColorOptions().map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newProfileData.color === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setNewProfileData({ ...newProfileData, color })}
                  >
                    {newProfileData.color === color && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          Create multiple profiles to separate personal, business, and shared expenses. 
          Each profile has its own transactions, settings, and statistics. 
          You can switch between profiles at any time.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  currentProfileCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileType: {
    fontSize: 12,
    color: '#666',
  },
  activeBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  profileActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
});

// ROUTINE FEATURE END 