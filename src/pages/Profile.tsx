import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CyclistProfile, User } from '@/types';
import { mockCyclistProfile } from '@/lib/mock-data';
import { User as UserIcon, Settings, Save } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState<CyclistProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simulate loading profile data
    setTimeout(() => {
      setProfile(mockCyclistProfile);
      setUser({
        id: 'user1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        avatar_url: '',
        strava_id: '12345',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleProfileChange = (field: keyof CyclistProfile, value: string | number | null) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <Button onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="physical">Physical Data</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Strava Connection</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.strava_id ? 'default' : 'secondary'}>
                    {user?.strava_id ? 'Connected' : 'Not Connected'}
                  </Badge>
                  {user?.strava_id && (
                    <span className="text-sm text-gray-600">ID: {user.strava_id}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile?.height_cm || ''}
                    onChange={(e) => handleProfileChange('height_cm', parseFloat(e.target.value) || null)}
                    placeholder="175"
                    min="120"
                    max="220"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inseam">Inseam (cm)</Label>
                  <Input
                    id="inseam"
                    type="number"
                    value={profile?.inseam_cm || ''}
                    onChange={(e) => handleProfileChange('inseam_cm', parseFloat(e.target.value) || null)}
                    placeholder="80"
                    min="60"
                    max="110"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="torso">Torso Length (cm)</Label>
                  <Input
                    id="torso"
                    type="number"
                    value={profile?.torso_cm || ''}
                    onChange={(e) => handleProfileChange('torso_cm', parseFloat(e.target.value) || null)}
                    placeholder="55"
                    min="40"
                    max="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arm">Arm Length (cm)</Label>
                  <Input
                    id="arm"
                    type="number"
                    value={profile?.arm_length_cm || ''}
                    onChange={(e) => handleProfileChange('arm_length_cm', parseFloat(e.target.value) || null)}
                    placeholder="60"
                    min="45"
                    max="80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cycling Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Cycling Experience</Label>
                  <Select 
                    value={profile?.cycling_experience || ''} 
                    onValueChange={(value) => handleProfileChange('cycling_experience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flexibility">Flexibility</Label>
                  <Select 
                    value={profile?.flexibility || ''} 
                    onValueChange={(value) => handleProfileChange('flexibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select flexibility level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Select 
                    value={profile?.primary_goal || ''} 
                    onValueChange={(value) => handleProfileChange('primary_goal', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="racing">Racing Performance</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="comfort">Comfort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}