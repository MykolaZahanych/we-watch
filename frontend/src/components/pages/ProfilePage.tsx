import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/api';
import type { Profile, UpdateProfileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await profileApi.get();
        setProfile(data);
        setAdditionalInfo(data.additionalInfo || '');
        setMembers(data.members);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleAddMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    } else {
      setError('At least one member is required');
    }
  };

  const hasChanges = useMemo(() => {
    if (!profile) return false;

    const current = {
      additionalInfo: additionalInfo.trim(),
      members: [...members].sort(),
    };

    const original = {
      additionalInfo: (profile.additionalInfo || '').trim(),
      members: [...profile.members].sort(),
    };

    return JSON.stringify(current) !== JSON.stringify(original);
  }, [additionalInfo, members, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (members.length === 0) {
      setError('At least one member is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateProfileData = {
        additionalInfo: additionalInfo.trim() || undefined,
        members,
      };
      const updatedProfile = await profileApi.update(updateData);
      setProfile(updatedProfile);
      setError(null);
      toast({
        variant: 'success',
        title: 'Profile updated successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Back to Movies
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="members">Members *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add members who can select movies. At least one member is required.
                </p>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={member}
                        onChange={(e) => {
                          const updated = [...members];
                          updated[index] = e.target.value;
                          setMembers(updated);
                        }}
                        className="flex-1"
                      />
                      {members.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      placeholder="Enter member name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMember}
                      disabled={!newMember.trim() || members.includes(newMember.trim())}
                    >
                      Add Member
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Info</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Add any additional information about your profile..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting || !hasChanges} className="flex-1">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

