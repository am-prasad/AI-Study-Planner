import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useSubjectsStore } from '@/store/subjectsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Sparkles, Plus, BookOpen, Trash2, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Subjects() {
  const { subjects, addSubject, deleteSubject } = useSubjectsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!name) return toast.error("Enter a subject name");
    
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('subject_name', name);
    formData.append('difficulty', '3');
    formData.append('total_hours', '40');
    formData.append('available_hours_per_week', '10');
    if (fileInputRef.current?.files?.[0]) {
      formData.append('file', fileInputRef.current.files[0]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/schedule/generate-timetable`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        addSubject({
          id: Date.now().toString(),
          name,
          difficulty: 3,
          totalHours: 40,
          completedHours: 0,
          availableHoursPerWeek: 10,
          color: '#6366f1',
          chapters: data.chapters.map((c: any, i: number) => ({
            id: `ch-${i}`,
            name: c.name,
            estimatedHours: c.estimated_hours,
            completed: false,
            topics: [],
            priority: c.priority
          }))
        });
        toast.success("AI Schedule Generated!");
        setName('');
      }
    } catch (e) {
      toast.error("Failed to connect to AI Backend");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <Input placeholder="Subject Name" value={name} onChange={e => setName(e.target.value)} />
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">Upload PDF</Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map(s => (
            <div key={s.id} className="p-4 border rounded-xl bg-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">{s.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => deleteSubject(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> {s.completedHours}/{s.totalHours} hours
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}