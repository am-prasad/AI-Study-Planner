import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Mail, Phone, Building, GraduationCap, Target, Save, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    grade: user?.grade || '',
    studyGoal: user?.studyGoal || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradeLabel = (grade: string) => {
    const labels: Record<string, string> = {
      'high-school-9': 'High School - 9th Grade',
      'high-school-10': 'High School - 10th Grade',
      'high-school-11': 'High School - 11th Grade',
      'high-school-12': 'High School - 12th Grade',
      'undergraduate-1': 'Undergraduate - 1st Year',
      'undergraduate-2': 'Undergraduate - 2nd Year',
      'undergraduate-3': 'Undergraduate - 3rd Year',
      'undergraduate-4': 'Undergraduate - 4th Year',
      'postgraduate': 'Postgraduate',
      'other': 'Other',
    };
    return labels[grade] || grade;
  };

  const getStudyGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      'exam-prep': 'Exam Preparation',
      'improve-grades': 'Improve Grades',
      'competitive-exams': 'Competitive Exams',
      'skill-development': 'Skill Development',
      'revision': 'Regular Revision',
      'other': 'Other',
    };
    return labels[goal] || goal;
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-primary">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences</p>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'gradient-primary shadow-glow' : ''}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl gradient-primary text-white">
                        {getInitials(user?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                      </button>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{user?.name || 'User'}</h3>
                  <p className="text-muted-foreground">@{user?.username || 'username'}</p>
                  {user?.institution && (
                    <p className="text-sm text-muted-foreground mt-1">{user.institution}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-foreground py-2">{user?.name || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Username
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-foreground py-2">@{user?.username || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-foreground py-2">{user?.email || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-foreground py-2">{user?.phone || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      Institution
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-foreground py-2">{user?.institution || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Grade / Year
                    </Label>
                    {isEditing ? (
                      <Select 
                        value={formData.grade} 
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school-9">High School - 9th Grade</SelectItem>
                          <SelectItem value="high-school-10">High School - 10th Grade</SelectItem>
                          <SelectItem value="high-school-11">High School - 11th Grade</SelectItem>
                          <SelectItem value="high-school-12">High School - 12th Grade</SelectItem>
                          <SelectItem value="undergraduate-1">Undergraduate - 1st Year</SelectItem>
                          <SelectItem value="undergraduate-2">Undergraduate - 2nd Year</SelectItem>
                          <SelectItem value="undergraduate-3">Undergraduate - 3rd Year</SelectItem>
                          <SelectItem value="undergraduate-4">Undergraduate - 4th Year</SelectItem>
                          <SelectItem value="postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-foreground py-2">{getGradeLabel(user?.grade || '') || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Study Goal
                    </Label>
                    {isEditing ? (
                      <Select 
                        value={formData.studyGoal} 
                        onValueChange={(value) => setFormData({ ...formData, studyGoal: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="What's your main goal?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exam-prep">Exam Preparation</SelectItem>
                          <SelectItem value="improve-grades">Improve Grades</SelectItem>
                          <SelectItem value="competitive-exams">Competitive Exams</SelectItem>
                          <SelectItem value="skill-development">Skill Development</SelectItem>
                          <SelectItem value="revision">Regular Revision</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-foreground py-2">{getStudyGoalLabel(user?.studyGoal || '') || '-'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="gradient-primary shadow-glow">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}