// am-prasad/ai-study-planner/.../Frontend/src/pages/Subjects.tsx

import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useSubjectsStore } from '@/store/subjectsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, Sparkles, Loader2, BookOpen, Clock } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000"; // Update to your backend URL

export default function Subjects() {
  const { subjects, addSubject, deleteSubject } = useSubjectsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [totalHours, setTotalHours] = useState(40);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!name || !fileInputRef.current?.files?.[0]) {
      return toast.error("Please enter a name and upload a syllabus PDF");
    }

    setIsGenerating(true);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('total_hours', totalHours.toString());
    formData.append('start_date', startDate); // Send user's start date

    try {
      const response = await fetch(`${API_BASE_URL}/schedule/upload-pdf`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        addSubject({
          name,
          difficulty: 3,
          totalHours,
          availableHoursPerWeek: 10,
          startDate,
          chapters: data.generated_schedule.map((item: any, i: number) => ({
            id: `ch-${i}`,
            name: item.topic,
            completed: false,
            progress: 0,
            estimatedHours: item.hours, // Difficulty-based allotment
            scheduledDate: item.date     // Assigned calendar date
          }))
        } as any);
        toast.success("Study plan generated successfully!");
      }
    } catch (e) {
      toast.error("Failed to connect to AI agent.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Physics" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload Syllabus PDF
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" />
            <Button onClick={handleGenerate} disabled={isGenerating} className="gradient-primary">
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate AI Plan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="glass-card p-5 border-border/50">
              <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
              <div className="text-sm text-muted-foreground mb-4">Starts: {subject.startDate}</div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {subject.chapters.map(ch => (
                  <div key={ch.id} className="flex justify-between text-xs p-2 bg-muted/40 rounded border border-border/20">
                    <span className="font-medium truncate max-w-[150px]">{ch.name}</span>
                    <span className="text-primary font-mono">{ch.scheduledDate} ({ch.estimatedHours}h)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}