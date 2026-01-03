import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Clock, TrendingUp, Trash2, Edit2, Upload, Calendar, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useSubjectsStore, Subject } from '@/store/subjectsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Subjects() {
  const { subjects, addSubject, deleteSubject, updateSubject } = useSubjectsStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    difficulty: 3,
    totalHours: 40,
    availableHoursPerWeek: 10,
    chapters: [] as any[],
    color: 'hsl(240 64% 60%)',
  });

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll use the file name as context
    // In production, you'd use a PDF parsing library or service
    return `Subject syllabus from file: ${file.name}`;
  };

  const handleGenerateTimetable = async () => {
    if (!newSubject.name.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    setIsGenerating(true);
    toast.info('AI is analyzing and generating your study timetable...');

    try {
      let syllabusText = '';
      
      // Upload syllabus to storage if selected
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('syllabi')
          .upload(fileName, selectedFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          syllabusText = await extractTextFromPDF(selectedFile);
        }
      }

      // Call AI to generate timetable
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: {
          syllabusText,
          subjectName: newSubject.name,
          availableHoursPerWeek: newSubject.availableHoursPerWeek,
          totalHours: newSubject.totalHours,
          difficulty: newSubject.difficulty,
        },
      });

      if (error) throw error;

      if (data?.success && data?.timetable) {
        const timetable = data.timetable;
        const subjectId = Date.now().toString();
        
        // Create chapters from AI response
        const chapters = timetable.chapters?.map((ch: any, index: number) => ({
          id: ch.id || `ch${index + 1}`,
          name: ch.name,
          completed: false,
          progress: 0,
          estimatedHours: ch.estimatedHours,
          topics: ch.topics,
          priority: ch.priority,
        })) || [];

        // Add subject with AI-generated chapters
        addSubject({
          ...newSubject,
          id: subjectId,
          chapters,
          syllabusUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
        } as any);

        toast.success(`🎉 ${newSubject.name} added with AI-generated study plan!`, {
          description: `${chapters.length} chapters planned over ${timetable.totalWeeks || Math.ceil(newSubject.totalHours / newSubject.availableHoursPerWeek)} weeks`,
        });

        // Reset form
        setNewSubject({ name: '', difficulty: 3, totalHours: 40, availableHoursPerWeek: 10, chapters: [], color: 'hsl(240 64% 60%)' });
        setSelectedFile(null);
        setIsAddDialogOpen(false);
      } else {
        throw new Error(data?.error || 'Failed to generate timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Failed to generate timetable. Adding subject without AI plan.');
      
      // Fallback: add subject without AI
      const subjectId = Date.now().toString();
      addSubject({ ...newSubject, id: subjectId } as any);
      setNewSubject({ name: '', difficulty: 3, totalHours: 40, availableHoursPerWeek: 10, chapters: [], color: 'hsl(240 64% 60%)' });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubjectManual = () => {
    if (!newSubject.name.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    const subjectId = Date.now().toString();
    addSubject({ ...newSubject, id: subjectId } as any);
    toast.success(`${newSubject.name} added successfully!`);
    
    setNewSubject({ name: '', difficulty: 3, totalHours: 40, availableHoursPerWeek: 10, chapters: [], color: 'hsl(240 64% 60%)' });
    setSelectedFile(null);
    setIsAddDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      toast.success('PDF selected! AI will analyze it to create your study plan.');
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleDeleteSubject = (id: string, name: string) => {
    deleteSubject(id);
    toast.success(`${name} removed`);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-primary">My Subjects</h1>
            <p className="text-muted-foreground mt-2">Manage your learning materials</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow gap-2">
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Mathematics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level: {newSubject.difficulty}</Label>
                  <Slider
                    value={[newSubject.difficulty]}
                    onValueChange={(value) => setNewSubject({ ...newSubject, difficulty: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Easy</span>
                    <span>Hard</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-hours">Estimated Study Hours: {newSubject.totalHours}h</Label>
                  <Slider
                    value={[newSubject.totalHours]}
                    onValueChange={(value) => setNewSubject({ ...newSubject, totalHours: value[0] })}
                    min={10}
                    max={200}
                    step={5}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available-hours">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Available Hours Per Week: {newSubject.availableHoursPerWeek}h
                    </div>
                  </Label>
                  <Slider
                    value={[newSubject.availableHoursPerWeek]}
                    onValueChange={(value) => setNewSubject({ ...newSubject, availableHoursPerWeek: value[0] })}
                    min={1}
                    max={40}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many hours per week can you dedicate to this subject?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Syllabus (PDF)
                    </div>
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {selectedFile ? selectedFile.name : 'Upload Syllabus PDF'}
                  </Button>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
                  <Button
                    onClick={handleGenerateTimetable}
                    disabled={isGenerating}
                    className="w-full gradient-primary gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Timetable with AI
                      </>
                    )}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddSubjectManual}
                    variant="outline"
                    className="w-full"
                  >
                    Add Without AI
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by adding your first subject to begin organizing your study plan
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="gradient-primary shadow-glow gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Subject
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {subjects.map((subject, index) => {
                const progress = subject.totalHours > 0
                  ? Math.round((subject.completedHours / subject.totalHours) * 100)
                  : 0;

                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-border/50 hover:shadow-lg transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-xl flex items-center justify-center shadow-md"
                              style={{ backgroundColor: subject.color }}
                            >
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`h-2 w-2 rounded-full ${
                                        i < subject.difficulty ? 'bg-primary' : 'bg-muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Difficulty
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => toast.info('Edit feature coming soon!')}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSubject(subject.id, subject.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{subject.completedHours}/{subject.totalHours}h</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="h-4 w-4" />
                              <span>{subject.chapters.length} chapters</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{subject.availableHoursPerWeek}h/week</span>
                            </div>
                            {subject.syllabusUrl && (
                              <a 
                                href={subject.syllabusUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                <span>Syllabus</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
