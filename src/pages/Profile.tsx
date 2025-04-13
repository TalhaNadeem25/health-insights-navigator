import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear password error when typing
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
    
    // Clear success message when making changes
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    
    try {
      // Validate if both password fields are filled and matching
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Only include fields that are non-empty in the update
      const updateData: {name?: string, email?: string, password?: string} = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      
      // Only proceed with update if there's something to update
      if (Object.keys(updateData).length > 0) {
        const result = await updateProfile(updateData);
        if (result) {
          setSuccess(true);
          // Clear password fields after successful update
          setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }));
        }
      } else {
        setSuccess(true); // No changes to save
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Your profile has been updated successfully.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile; 